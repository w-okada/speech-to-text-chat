import { Pool } from "pg";
import { replaceWordsList } from "./replaceWordsList";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});

type ReplaceWords = { [input: string]: string };
type AllReplaceWords = { [temaId: string]: ReplaceWords };

const replaceWords: AllReplaceWords = {};
const replaceWordsListDecoded = Buffer.from(replaceWordsList, "base64");
const globalReplaceWords = JSON.parse(decodeURIComponent(replaceWordsListDecoded.toString()));

const loadReplaceWords = async (teamId: string): Promise<ReplaceWords> => {
    var query = {
        text: "SELECT * FROM public.replace_words WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            console.log("no record!!");
            return globalReplaceWords;
        }
        return JSON.parse(res.rows[0].data);
    } catch (exception) {
        console.log("load replace words information error:", JSON.stringify(exception));
        return globalReplaceWords;
    }
};

const saveReplaceWords = async (teamId: string, data: ReplaceWords) => {
    var query = {
        text: "SELECT * FROM public.replace_words WHERE team_id = $1",
        values: [teamId],
    };

    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            // Insert
            var insertQuery = {
                text: "INSERT INTO public.replace_words (team_id, data) VALUES($1, $2)",
                values: [teamId, JSON.stringify(data)],
            };
            console.log("insert::", JSON.stringify(data));
            await client.query(insertQuery);
        } else {
            // update
            var deleteQuery = {
                text: "UPDATE public.replace_words SET data = $2 WHERE team_id = $1",
                values: [teamId, JSON.stringify(data)],
            };
            await client.query(deleteQuery);
        }
    } catch (exception) {
        console.log("save replace words information error:", JSON.stringify(exception));
    }
};

export const getReplcaceWord = async (teamId: string) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    return replaceWords[teamId];
};

export const addReplcaceWord = async (teamId: string, input: string, output: string) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    replaceWords[teamId][input] = output;
    await saveReplaceWords(teamId, replaceWords[teamId]);
};
export const deleteReplcaceWord = async (teamId: string, input: string) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    delete replaceWords[teamId][input];
    await saveReplaceWords(teamId, replaceWords[teamId]);
};

export const replaceWord = async (teamId: string, message: string) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    // console.log(globalReplaceWords);
    return Object.keys(replaceWords[teamId]).reduce((prev, inputWord) => {
        const outputWord = replaceWords[teamId][inputWord];
        const res = prev.replace(new RegExp(inputWord, "g"), outputWord);
        return res;
    }, message);
};
