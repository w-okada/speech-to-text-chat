import { Installation, InstallationQuery } from "@slack/bolt";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: true,
    ssl: {
        rejectUnauthorized: false,
    },
});

const database = {};
export const addTeamInformation = async <AuthVersion extends "v1" | "v2">(installation: Installation<AuthVersion, boolean>) => {
    console.log("STORE INSTALATTION!!!!!!!!!!!");
    // console.dir(database, { depth: 5 });
    var query = {
        text: "INSERT INTO public.auths (team_id, data) VALUES($1, $2)",
        values: [installation.team.id, JSON.stringify(installation)],
    };
    try {
        const client = await pool.connect();
        await client.query(query);
    } catch (exception) {
        console.log("add team information error:", JSON.stringify(exception));
    }

    database[installation.team.id] = installation;
};

const queryInstallation = async (teamId: string) => {
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
    } catch (exception) {
        console.log("get team information error:", JSON.stringify(exception));
    }
    return null;
};

export const fetchInstallation = async (installQuery: InstallationQuery<boolean>) => {
    console.log("FETCH INSTALATTION!!!!!!!!!!!");
    if (!database[installQuery.teamId]) {
        database[installQuery.teamId] = await queryInstallation(installQuery.teamId);
    }
    return database[installQuery.teamId];
};

export const deleteInstallation = async (installQuery: InstallationQuery<boolean>) => {
    console.log("DELETE INSTALATTION!!!!!!!!!!!1");
    delete database[installQuery.teamId];
    return;
};

export const fetchToken = async (teamId: string) => {
    if (!database[teamId]) {
        database[teamId] = await queryInstallation(teamId);
    }
    return database[teamId].bot.token;
};
