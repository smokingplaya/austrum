import User from "./user";
import Database from "../../database";
import { SQLSafe } from "../../utils";

const database = new Database();
database.CreateTable("groups", {
    "username": "UniqueText",
    "rank": "TEXT NOT NULL",
    "expire": "INTEGER"
});

class Group {
    static default = "user";

    name: string = "";
    niceName: string = "";
    discordID: string = "";
    flags: string = "";

    constructor(name) {
        this.name = name;
    }

    static Expire(user: User): number {
        let username = user.Username;

        let dbUser = database.GetQuery(`SELECT * FROM groups WHERE username=${SQLSafe(username)};`);

        if (!dbUser) return 0;

        if (dbUser.rank != user.Rank) return 0;

        return dbUser.expire;
    }

    get Name() {
        return this.name;
    }

    // nice name

    set NiceName(name: string) {
        this.niceName = name;
    }

    get NiceName() {
        return this.niceName;
    }

    // discord role id

    set DiscordID(id: string) {
        this.discordID = id;
    }

    get DiscordID() {
        return this.discordID;
    }

    // flags

    set Flags(flags: string) {
        this.flags = flags;
    }

    get Flags() {
        return this.flags;
    }
}

export default Group;