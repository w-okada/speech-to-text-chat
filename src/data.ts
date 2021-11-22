//////////////
// Chat Data
//////////////

export const generateInitialRoom = (key: string, teamId: string, channelId: string, channelName: string | null, ts: string, roomName: string, voiceChatTs: string | null, voiceChatId: string | null, enabled: boolean): ROOM => {
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

export type ROOM = {
    key: string;
    teamId: string;
    channelId: string;
    channelName: string;
    ts: string;
    roomName: string;
    voiceChatTs: string | null;
    voiceChatId: string | null;
    enabled: boolean;
    words: {
        userId: string;
        userName: string;
        word: string;
        timestamp: number;
        imageUrl: string;
    }[];
};

export type ROOMS = {
    [key: string]: ROOM;
};

///////////////
// User Data
//////////////
export type UserInformation = {
    team_id: string;
    channel_id: string;
    channel_name: string;
    user_id: string;
    user_name: string;
    secret?: string;
    room_name: string;
    room_key: string;
    image_url: string;
};
