"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchToken = exports.deleteInstallation = exports.fetchInstallation = exports.addTeamInformation = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});
const database = {};
const addTeamInformation = async (installation) => {
    // console.log("STORE INSTALATTION!!!!!!!!!!!");
    // console.dir(database, { depth: 5 });
    var query = {
        text: "INSERT INTO public.auths (team_id, data) VALUES($1, $2)",
        values: [installation.team.id, JSON.stringify(installation)],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    }
    catch (exception) {
        console.log("add team information error:", JSON.stringify(exception));
    }
    database[installation.team.id] = installation;
};
exports.addTeamInformation = addTeamInformation;
const queryInstallation = async (teamId) => {
    var query = {
        text: "SELECT * FROM public.auths WHERE team_id = $1",
        values: [teamId],
    };
    try {
        const client = await pool.connect();
        const res = await client.query(query);
        if (res.rows.length == 0) {
            console.log("no record!!");
            throw new Error("no record!!");
        }
        const data = JSON.parse(res.rows[0].data);
        return data;
    }
    catch (exception) {
        console.log("get team information error:", JSON.stringify(exception));
    }
    return null;
};
const fetchInstallation = async (installQuery) => {
    // console.log("FETCH INSTALATTION!!!!!!!!!!!");
    if (!database[installQuery.teamId]) {
        database[installQuery.teamId] = await queryInstallation(installQuery.teamId);
    }
    return database[installQuery.teamId];
};
exports.fetchInstallation = fetchInstallation;
const deleteInstallation = async (installQuery) => {
    // console.log("DELETE INSTALATTION!!!!!!!!!!!1");
    delete database[installQuery.teamId];
    return;
};
exports.deleteInstallation = deleteInstallation;
const fetchToken = async (teamId) => {
    if (!database[teamId]) {
        database[teamId] = await queryInstallation(teamId);
    }
    return database[teamId].bot.token;
};
exports.fetchToken = fetchToken;
