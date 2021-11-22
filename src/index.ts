import { App, AppOptions, ExpressReceiver, Installation, InstallationQuery } from "@slack/bolt";
import * as express from "express";
import { generateControlBlocks, generateHelpBlocks, generateOpenURLBlocks, generateWholeBlocks } from "./blocks";
import { generateInitialRoom, ROOMS, UserInformation } from "./data";
import { Encrypter } from "./encrypt";
import { v4 } from "uuid";
import { addTeamInformation, deleteInstallation, fetchInstallation, fetchToken } from "./auth";
const BASE_URL = process.env.APP_HEROKU_URL;
const port: number = Number(process.env.PORT) || 3000;
const rooms: ROOMS = {};
const urlEncrypter = new Encrypter({});

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: `/slack/events`,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ["channels:history", "chat:write", "commands", "groups:history", "users:read"],
    installationStore: {
        storeInstallation: async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
            addTeamInformation(installation);
            return;
        },
        fetchInstallation: async (installQuery: InstallationQuery<boolean>) => {
            return fetchInstallation(installQuery);
        },
        deleteInstallation: async (installQuery: InstallationQuery<boolean>) => {
            deleteInstallation(installQuery);
            return;
        },
    },
    installerOptions: {
        directInstall: true,
    },
});

const STATIC_PATH = __dirname + "/../frontend/dist/";
// console.log(STATIC_PATH);
receiver.app.use(express.json());
receiver.app.use("/static", express.static(STATIC_PATH));

const config: AppOptions = {
    receiver,
    // token: process.env.SLACK_BOT_TOKEN, // for one workspace複数ワークスペースの場合はoauth installer or authorizeを使えと。
    // signingSecret: process.env.SLACK_SIGNING_SECRET,
};

/// START APP ////
const app = new App(config);

// console.dir(app, { depth: 10 });

///////////////////////////////////////////////
//　REST API
///////////////////////////////////////////////
/**
 * Get Information
 */
receiver.app.post(`/api/decodeInformation`, async (req, res) => {
    const encInfo = req.body["encInfo"];
    const info = urlEncrypter.decodeInformation<UserInformation>(encInfo);
    res.send(JSON.stringify(info));
});

/**
 * Post words
 */
receiver.app.post(`/api/words`, async (req, res) => {
    const encInfo = req.body["encInfo"];
    const word = req.body["word"];
    // console.log(req.body);
    const info = urlEncrypter.decodeInformation<UserInformation>(encInfo);
    if (info === null) {
        res.send(JSON.stringify({ success: false }));
    }
    res.send(JSON.stringify({ success: true }));

    const token = await fetchToken(info.team_id);
    /// update db ////
    const room = rooms[info.room_key];
    if (!room) {
        console.log(`[Exception]: the room is not found.[${info.room_key}]`);
    }

    room.words.push({
        userId: info.user_id,
        userName: info.user_name,
        imageUrl: info.image_url,
        timestamp: new Date().getTime(),
        word: word,
    });

    const blocks = generateWholeBlocks(room);
    const msg = {
        channel: info.channel_id,
        ts: room.ts,
        blocks: blocks,
        token: token,
        text: "rendering failed??",
    };
    await app.client.chat.update(msg);
    return;
});

/**
 * Delete Message
 */
receiver.app.delete(`/api/words`, async (req, res) => {
    const team_id = req.body["team_id"];
    const channel_id = req.body["channel_id"];
    const ts = req.body["ts"];

    const token = await fetchToken(team_id);
    const msg = {
        channel: channel_id,
        ts: ts,
        token: token,
    };
    app.client.chat.delete(msg);
    res.send(JSON.stringify({ success: true }));
    return;
});

/// BOLT MANAGE ////
const start = async () => {
    console.log("Bolt app is running!");

    ///////////////////////////////////////////////
    //　スラッシュコマンド
    ///////////////////////////////////////////////
    /**
     * 明示的なスラッシュコマンドによる起動
     */
    app.command("/speech-to-text-chat", async ({ command, ack, say }) => {
        await ack();
        const token = await fetchToken(command.team_id);
        //// helpを入力された場合
        if (command.text === "help") {
            const helpBlocks = generateHelpBlocks();
            app.client.chat.postEphemeral({
                channel: command.channel_id,
                blocks: helpBlocks,
                user: command.user_id,
                token: token,
            });
            return;
        }

        /// 通常ケース
        const uuid = v4();
        const room = generateInitialRoom(uuid, command.team_id, command.channel_id, command.channel_name, "", command.text, null, null, true);
        const controlBlocks = generateControlBlocks(room);

        const msg = {
            // @ts-ignore
            channel: command.channel_id,
            // token: process.env.SLACK_BOT_TOKEN,
            token: token,
            blocks: controlBlocks,
            text: "rendering failed??",
        };

        const postResult = await app.client.chat.postMessage(msg);
        const ts = postResult.ts;
        room.ts = ts;
        rooms[uuid] = room;
    });

    ///////////////////////////////////////////////
    // イベント
    ///////////////////////////////////////////////

    /**
     * 通話開始イベントを検知した場合の起動
     */
    app.event(/message|message.groups/, async ({ event, body, payload }) => {
        console.log("event", event);
        // console.log("body", body);
        // console.log("payload", payload);

        const token = await fetchToken(body.team_id);
        // console.log("TOKEN!!!!", token);

        // @ts-ignore
        if (event.subtype == "sh_room_created") {
            const uuid = v4();
            // @ts-ignore
            const room = generateInitialRoom(uuid, body.team_id, event.channel, null, "", "Slack-Voice-Chat", event.ts, event.room.id, true);
            const controlBlocks = generateControlBlocks(room);

            const msg = {
                // @ts-ignore
                channel: event.channel,
                // token: process.env.SLACK_BOT_TOKEN,
                token: token,
                blocks: controlBlocks,
                text: "rendering failed??",
            };

            const postResult = await app.client.chat.postMessage(msg);
            const ts = postResult.ts;
            room.ts = ts;
            rooms[uuid] = room;

            ///////////// Call の情報を取得しようとしたが動かなかった
            // // @ts-ignore
            // console.log("", event.room.id);
            // try {
            //     // @ts-ignore
            //     const callInfo = await app.client.calls.info({ id: event.room.id });
            //     console.log("Call Info:", callInfo);
            // } catch (Exception) {
            //     console.log("EXCEPTION!!!!!!!!!!!!!!!!!!!!", Exception);
            //     console.log("EXCEPTION!!!!!!!!!!!!!!!!!!!!", JSON.stringify(Exception));
            // }
        }
    });

    ///////////////////////////////////////////////
    //　アクション
    ///////////////////////////////////////////////
    /**
     * トグルスイッチ
     */
    app.action("toggle_enabled", async ({ body, action, ack, respond }) => {
        await ack();
        // @ts-ignore
        const roomKey = action.value;
        const room = rooms[roomKey];
        const userId = body.user.id;
        // @ts-ignore
        const userName = body.user.username;
        const channelId = body.channel.id;

        const token = await fetchToken(body.team.id);
        // console.log("TOKEN!!!!", token);

        if (!room) {
            app.client.chat.postEphemeral({
                channel: channelId,
                text: `ROOM[${roomKey}] not found`,
                user: userId,
                token: token,
            });
            return;
        }
        ///////////// Call の情報を取得しようとしたが動かなかった
        // // @ts-ignore
        // console.log("room.voiceChatId:::", room.voiceChatId);
        // try {
        //     // @ts-ignore
        //     const callInfo = await app.client.calls.info({ id: room.voiceChatId });
        //     console.log("Call Info:", callInfo);
        // } catch (Exception) {
        //     console.log("EXCEPTION!!!!!!!!!!!!!!!!!!!!", Exception);
        //     console.log("EXCEPTION!!!!!!!!!!!!!!!!!!!!", JSON.stringify(Exception));
        // }

        room.enabled = !room.enabled;
        if (room.channelName == "") {
            room.channelName = body.channel.name;
        }
        const blocks = generateWholeBlocks(room);
        await respond({
            response_type: "in_channel",
            replace_original: true, // メッセージを置き換える
            blocks: blocks,
        });
        return;
    });

    /**
     * Joinボタンが押された時
     */
    app.action("join", async ({ body, action, ack, respond }) => {
        await ack();
        // @ts-ignore
        const roomKey = action.value;
        const room = rooms[roomKey];
        const userId = body.user.id;
        // @ts-ignore
        const userName = body.user.username;
        const channelId = body.channel.id;
        const channelName = body.channel.name;

        const token = await fetchToken(body.team.id);
        if (!room) {
            app.client.chat.postEphemeral({
                channel: channelId,
                text: `ROOM[${roomKey}] not found`,
                user: userId,
                token: token,
            });
            return;
        }
        if (room.channelName == "") {
            room.channelName = body.channel.name;
        }

        const userInfo = await app.client.users.info({
            user: userId,
            token: token,
        });
        const user: UserInformation = {
            team_id: body.team.id,
            channel_id: channelId,
            channel_name: channelName,
            user_id: userId,
            user_name: userName,
            room_name: room.roomName,
            room_key: room.key,
            image_url: userInfo["user"]["profile"]["image_192"],
        };

        const encInfo = urlEncrypter.encodeInformation<UserInformation>(user);

        const url = `${BASE_URL}static/index.html?token=${encInfo}`;
        const res = await app.client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            blocks: generateOpenURLBlocks(url),
            text: "redering failed!?",
            token: token,
        });
        return;
    });

    /**
     * opentab
     */
    app.action("openTab", async ({ body, action, ack, respond }) => {
        await ack();
        // console.log("OPENTAB CLICKED!!!");
        respond({ delete_original: true });
        return;
    });
    // //// Slack通話の変更は検知できない？？
    // app.event("channel_history_changed", async ({ event, context }) => {
    //     console.log("ch_event", event);
    //     console.log("ch_context", context);
    // });
    await app.start(port);
};

/// MAIN ////
(async () => {
    await start();
})();
