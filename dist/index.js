"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const express = __importStar(require("express"));
const blocks_1 = require("./blocks");
const data_1 = require("./data");
const encrypt_1 = require("./encrypt");
const uuid_1 = require("uuid");
const auth_1 = require("./auth");
const BASE_URL = process.env.HEROKU_URL;
const port = Number(process.env.PORT) || 3000;
const rooms = {};
const receiver = new bolt_1.ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: `/slack/events`,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ["channels:history", "chat:write", "commands", "groups:history", "users:read"],
    installationStore: {
        storeInstallation: async (installation) => {
            (0, auth_1.addTeamInformation)(installation);
            return;
        },
        fetchInstallation: async (installQuery) => {
            return (0, auth_1.fetchInstallation)(installQuery);
        },
        deleteInstallation: async (installQuery) => {
            (0, auth_1.deleteInstallation)(installQuery);
            return;
        },
    },
});
const STATIC_PATH = __dirname + "/../frontend/dist/";
// console.log(STATIC_PATH);
receiver.app.use(express.json());
receiver.app.use("/static", express.static(STATIC_PATH));
const config = {
    receiver,
    // token: process.env.SLACK_BOT_TOKEN, // for one workspace複数ワークスペースの場合はoauth installer or authorizeを使えと。
    // signingSecret: process.env.SLACK_SIGNING_SECRET,
};
/// START APP ////
const app = new bolt_1.App(config);
// console.dir(app, { depth: 10 });
///////////////////////////////////////////////
//　REST API
///////////////////////////////////////////////
/**
 * Get Information
 */
receiver.app.post(`/api/decodeInformation`, async (req, res) => {
    const encInfo = req.body["encInfo"];
    const info = (0, encrypt_1.decodeInformation)(encInfo);
    res.send(JSON.stringify(info));
});
/**
 * Post words
 */
receiver.app.post(`/api/words`, async (req, res) => {
    const encInfo = req.body["encInfo"];
    const word = req.body["word"];
    // console.log(req.body);
    const info = (0, encrypt_1.decodeInformation)(encInfo);
    if (info === null) {
        res.send(JSON.stringify({ success: false }));
    }
    res.send(JSON.stringify({ success: true }));
    const token = await (0, auth_1.fetchToken)(info.team_id);
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
    const blocks = (0, blocks_1.generateWholeBlocks)(room);
    const msg = {
        channel: info.channel_id,
        ts: room.ts,
        blocks: blocks,
        token: token,
    };
    await app.client.chat.update(msg);
    return;
});
/**
 * Delete Message
 */
receiver.app.delete(`/api/words`, async (req, res) => {
    const channel_id = req.body["channel_id"];
    const ts = req.body["ts"];
    const msg = {
        channel: channel_id,
        ts: ts,
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
        const token = await (0, auth_1.fetchToken)(command.team_id);
        //// helpを入力された場合
        if (command.text === "help") {
            const helpBlocks = (0, blocks_1.generateHelpBlocks)();
            app.client.chat.postEphemeral({
                channel: command.channel_id,
                blocks: helpBlocks,
                user: command.user_id,
                token: token,
            });
            return;
        }
        /// 通常ケース
        const uuid = (0, uuid_1.v4)();
        const room = (0, data_1.generateInitialRoom)(uuid, command.team_id, command.channel_id, command.channel_name, "", command.text, null, null, true);
        const controlBlocks = (0, blocks_1.generateControlBlocks)(room);
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
        const token = await (0, auth_1.fetchToken)(body.team_id);
        // console.log("TOKEN!!!!", token);
        // @ts-ignore
        if (event.subtype == "sh_room_created") {
            const uuid = (0, uuid_1.v4)();
            // @ts-ignore
            const room = (0, data_1.generateInitialRoom)(uuid, body.team_id, event.channel, null, "", "Slack-Voice-Chat", event.ts, event.room.id, true);
            const controlBlocks = (0, blocks_1.generateControlBlocks)(room);
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
        const token = await (0, auth_1.fetchToken)(body.team.id);
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
        const blocks = (0, blocks_1.generateWholeBlocks)(room);
        await respond({
            response_type: "in_channel",
            replace_original: true,
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
        const token = await (0, auth_1.fetchToken)(body.team.id);
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
        const user = {
            team_id: body.team.id,
            channel_id: channelId,
            channel_name: channelName,
            user_id: userId,
            user_name: userName,
            room_name: room.roomName,
            room_key: room.key,
            image_url: userInfo["user"]["profile"]["image_192"],
        };
        const encInfo = (0, encrypt_1.encodeInformation)(user);
        const url = `${BASE_URL}static/index.html?token=${encInfo}`;
        const res = await app.client.chat.postEphemeral({
            channel: channelId,
            user: userId,
            blocks: (0, blocks_1.generateOpenURLBlocks)(url),
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