import { ROOM } from "./data";

const MAX_MESSAGE_NUM = 12;

export const generateControlBlocks = (data: ROOM) => {
    const blocks: any[] = [];
    const enbaleLabel = data.enabled ? "enabled" : "disabled";
    const buttonLabel = data.enabled ? "disable" : "enable";

    const headerBlock = {
        type: "header",
        text: {
            type: "plain_text",
            text: data.roomName || "ROOM",
            emoji: true,
        },
    };
    blocks.push(headerBlock);
    const topBlock = {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `*Expose your conversation!!:smiley:*  [status: ${enbaleLabel}]`,
        },
    };
    blocks.push(topBlock);

    if (data.enabled) {
        const secondBlock = {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: "join",
                    },
                    action_id: "join",
                    value: data.key,
                    style: "primary",
                },
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: `${buttonLabel}`,
                    },
                    action_id: "toggle_enabled",
                    value: data.key,
                    style: "danger",
                },
            ],
        };
        blocks.push(secondBlock);
    } else {
        const secondBlock = {
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        emoji: true,
                        text: `${buttonLabel}`,
                    },
                    action_id: "toggle_enabled",
                    value: data.key,
                    style: "primary",
                },
            ],
        };
        blocks.push(secondBlock);
    }
    return blocks;
};

export const generateMessageBlocks = (room: ROOM) => {
    const blocks: any[] = [];

    return room.words.slice(-1 * MAX_MESSAGE_NUM).map((entry) => {
        const text = `*${entry.userName}*: ${entry.word} [${new Date(entry.timestamp).toLocaleTimeString()}]`;
        return {
            type: "context",
            elements: [
                {
                    type: "image",
                    image_url: entry.imageUrl,
                    alt_text: "icon",
                },
                {
                    type: "mrkdwn",
                    text: text,
                },
            ],
        };
    });
};

export const generateWholeBlocks = (room: ROOM) => {
    if (room.enabled) {
        const controlBlocks = generateControlBlocks(room);
        const messageBlocks = generateMessageBlocks(room);
        return [...controlBlocks, ...messageBlocks];
    } else {
        const controlBlocks = generateControlBlocks(room);
        return [...controlBlocks];
    }
};
export const generateOpenURLBlocks = (url: string) => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `Open new tab to join the exposed conversion.`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                url: url,
                action_id: "openTab",
            },
        },
    ];
};

export const generateHelpBlocks = () => {
    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `SHOWING HELP`,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "openTab",
                },
                action_id: "openTab",
            },
        },
    ];
};
