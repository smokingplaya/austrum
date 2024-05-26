import Database from "../database";
import User from "../user/class/user";
import { SQLSafe, GetTime } from "../utils";

const database = new Database();
database.CreateTable("bans", {
    "id": "ID",
    "username": "TEXT NOT NULL",
    "adminID": "INTEGER NOT NULL",
    "adminName": "TEXT NOT NULL",
    "reason": "TEXT NOT NULL",
    "ban_time": "TEXT NOT NULL",
    "unban_time": "TEXT"
});

let bans = {
    Unban: (user: User) => {
        let username = SQLSafe(user.Username);

        database.RunQuery(`UPDATE users SET blocked='0' WHERE username=${username}`);
        database.RunQuery(`DELETE FROM bans WHERE username=${username}`);
    },

    Get: (user: User) => {
        let data = database.GetQuery(`SELECT * FROM bans WHERE username=${SQLSafe(user.Username)}`);
        let currentTime = GetTime();

        if (!data && user.Blocked || (data.unban_time != "0" && currentTime > parseInt(data.unban_time)))
            return bans.Unban(user);

        return data;
    },

    Give: (user: User, reason: string, unban_time: number, admin: User) => {
        let record = database.GetQuery(`SELECT * FROM bans WHERE username=${SQLSafe(user.Username)};`);
        let time = GetTime();

        let adminID = SQLSafe(admin.ID);
        let adminName = SQLSafe(admin.Username);
        let reas = SQLSafe(reason);
        let t = SQLSafe(time);
        let unbantime = SQLSafe(time + unban_time);

        database.RunQuery(`UPDATE users SET blocked=1 WHERE username=${SQLSafe(user.Username)}`);

        database.RunQuery(record ?
            `UPDATE bans SET adminID=${adminID}, adminName=${adminName}, reason=${reas}, ban_time=${t}, unban_time=${unbantime}  WHERE id=${SQLSafe(record.id)}` :
            `INSERT INTO bans(username, adminID, adminName, reason, ban_time, unban_time) VALUES(${SQLSafe(user.Username)}, ${adminID}, ${adminName}, ${reas}, ${t}, ${unbantime})`
        );
    }
};

export default bans;