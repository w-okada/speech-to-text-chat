"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchToken = exports.deleteInstallation = exports.fetchInstallation = exports.addTeamInformation = void 0;
const pg_1 = require("pg");
const encrypt_1 = require("./encrypt");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
const authEncrypter = new encrypt_1.Encrypter({
    password: process.env.APP_DB_PASSWORD || "pass",
    salt: process.env.APP_DB_SALT || "salt",
    secret: process.env.APP_DB_SECRET || "secret",
});
const database = {};
const addInstllationToDB = async (installation) => {
    const info = JSON.stringify(installation);
    const encInfo = authEncrypter.encodeInformation(info);
    var query = {
        text: "INSERT INTO public.auths (team_id, data) VALUES($1, $2)",
        values: [installation.team.id, encInfo],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    }
    catch (exception) {
        console.log("add team information error:", JSON.stringify(exception));
    }
};
const queryInstallationFromDB = async (teamId) => {
    var query = {
        text: "SELECT * FROM public.auths WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            console.log("no record!!");
            return null;
        }
        const encInfo = authEncrypter.decodeInformation(res.rows[0].data);
        const info = JSON.parse(encInfo);
        return info;
    }
    catch (exception) {
        console.log("get team information error:", JSON.stringify(exception));
    }
    return null;
};
const deleteInstallationFromDB = async (teamId) => {
    var query = {
        text: "DELETE FROM public.auths WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    }
    catch (exception) {
        console.log("delete team information error:", JSON.stringify(exception));
    }
    return null;
};
const addTeamInformation = async (installation) => {
    // console.log("STORE INSTALATTION!!!!!!!!!!!");
    // console.dir(database, { depth: 5 });
    const existInformation = await queryInstallationFromDB(installation.team.id);
    if (existInformation) {
        await deleteInstallationFromDB(installation.team.id);
    }
    await addInstllationToDB(installation);
    database[installation.team.id] = installation;
};
exports.addTeamInformation = addTeamInformation;
const fetchInstallation = async (installQuery) => {
    // console.log("FETCH INSTALATTION!!!!!!!!!!!");
    if (!database[installQuery.teamId]) {
        database[installQuery.teamId] = await queryInstallationFromDB(installQuery.teamId);
    }
    return database[installQuery.teamId];
};
exports.fetchInstallation = fetchInstallation;
const deleteInstallation = async (installQuery) => {
    // console.log("DELETE INSTALATTION!!!!!!!!!!!");
    delete database[installQuery.teamId];
    return;
};
exports.deleteInstallation = deleteInstallation;
const fetchToken = async (teamId) => {
    if (!database[teamId]) {
        database[teamId] = await queryInstallationFromDB(teamId);
    }
    if (database[teamId]) {
        return database[teamId].bot.token;
    }
    else {
        return null;
    }
};
exports.fetchToken = fetchToken;
