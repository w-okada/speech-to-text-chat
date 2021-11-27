"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceWord = exports.deleteReplcaceWord = exports.addReplcaceWord = exports.getReplcaceWord = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
const replaceWords = {};
const loadReplaceWords = async (teamId) => {
    var query = {
        text: "SELECT * FROM public.replace_words WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            console.log("no record!!");
            return {};
        }
        return JSON.parse(res.rows[0].data);
    }
    catch (exception) {
        console.log("load replace words information error:", JSON.stringify(exception));
        return {};
    }
};
const saveReplaceWords = async (teamId, data) => {
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
        }
        else {
            // update
            var deleteQuery = {
                text: "UPDATE public.replace_words SET data = $2 WHERE team_id = $1",
                values: [teamId, JSON.stringify(data)],
            };
            await client.query(deleteQuery);
        }
    }
    catch (exception) {
        console.log("save replace words information error:", JSON.stringify(exception));
    }
};
const getReplcaceWord = async (teamId) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    return replaceWords[teamId];
};
exports.getReplcaceWord = getReplcaceWord;
const addReplcaceWord = async (teamId, input, output) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    replaceWords[teamId][input] = output;
    await saveReplaceWords(teamId, replaceWords[teamId]);
};
exports.addReplcaceWord = addReplcaceWord;
const deleteReplcaceWord = async (teamId, input) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    delete replaceWords[teamId][input];
    await saveReplaceWords(teamId, replaceWords[teamId]);
};
exports.deleteReplcaceWord = deleteReplcaceWord;
const replaceWord = async (teamId, message) => {
    if (!replaceWords[teamId]) {
        replaceWords[teamId] = await loadReplaceWords(teamId);
    }
    return Object.keys(replaceWords[teamId]).reduce((prev, inputWord) => {
        const outputWord = replaceWords[teamId][inputWord];
        // const res = prev.replace(/`${inputWord}`/g, outputWord);
        const res = prev.replace(new RegExp(inputWord, "g"), outputWord);
        return res;
    }, message);
};
exports.replaceWord = replaceWord;
