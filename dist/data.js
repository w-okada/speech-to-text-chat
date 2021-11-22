"use strict";
//////////////
// Chat Data
//////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInitialRoom = void 0;
const generateInitialRoom = (key, teamId, channelId, channelName, ts, roomName, voiceChatTs, voiceChatId, enabled) => {
    return {
        key,
        teamId,
        channelId,
        channelName,
        ts,
        roomName,
        voiceChatTs,
        voiceChatId,
        enabled,
        words: [],
    };
};
exports.generateInitialRoom = generateInitialRoom;
