import { GeneralResponse, RoomInfo } from "../types/types";

export class RestApiClient {
    private _baseUrl: string | null = null;

    constructor(baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    decodeInformation = async (encInfo: string): Promise<RoomInfo> => {
        const url = `${this._baseUrl}/api/decodeInformation`;
        console.log(url);
        console.log(this._baseUrl);
        const request = {
            encInfo: encInfo,
        };
        const requestBody = JSON.stringify(request);
        console.log(requestBody);
        const response = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data: RoomInfo = await response.json();

        return data;
    };

    sendWords = async (encInfo: string, word: string) => {
        const url = `${this._baseUrl}/api/words`;
        console.log(url);
        console.log(this._baseUrl);
        const request = {
            encInfo: encInfo,
            word: word,
        };
        const requestBody = JSON.stringify(request);
        console.log(requestBody);
        const response = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data: GeneralResponse = await response.json();
        return data;
    };

    deleteWords = async (team_id: string, channel_id: string, ts: string) => {
        const url = `${this._baseUrl}/api/words`;
        console.log(url);
        console.log(this._baseUrl);
        const request = {
            team_id: team_id,
            channel_id: channel_id,
            ts: ts,
        };
        const requestBody = JSON.stringify(request);
        console.log(requestBody);
        const response = await fetch(url, {
            method: "DELETE",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data: GeneralResponse = await response.json();
        return data;
    };

    addReplaceWord = async (encInfo: string, inputWord: string, outputWord: string) => {
        const url = `${this._baseUrl}/api/replaceWords`;
        const request = {
            encInfo: encInfo,
            input_word: inputWord,
            output_word: outputWord,
        };
        const requestBody = JSON.stringify(request);
        console.log(requestBody);
        const response = await fetch(url, {
            method: "POST",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data: GeneralResponse = await response.json();
        return data;
    };

    deleteReplaceWord = async (encInfo: string, inputWord: string) => {
        const url = `${this._baseUrl}/api/replaceWords`;
        const request = {
            encInfo: encInfo,
            input_word: inputWord,
        };
        const requestBody = JSON.stringify(request);
        console.log(requestBody);
        const response = await fetch(url, {
            method: "DELETE",
            body: requestBody,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data: GeneralResponse = await response.json();
        return data;
    };
}
