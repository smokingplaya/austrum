import Database from "./database";
import User from "./user/class/user";
import { SQLSafe } from "./utils";

const database = new Database();
database.CreateTable("avatars", {
    "username": "TEXT NOT NULL UNIQUE",
    "avatarURI": "TEXT NOT NULL"
});

let colors = ["0D3A32", "224942", "245B47", "223546", "192A3C", "9B773D", "0B1C3E", "016764", "005958", "005958"]; // 10 цветов

let avatar = {
    Add: (username: string): string => {
        let avatar_color = colors[username.length % 10];

        database.RunQuery(`INSERT INTO avatars VALUES(${SQLSafe(username)}, ${SQLSafe(avatar_color)})`);

        return avatar_color;
    },

    GetColor: (username: string) => {
        return database.GetQuery(`SELECT avatarURI from avatars WHERE username=${SQLSafe(username)};`).avatarURI;
    },

    GetNick: (user: User | string) => {
        return typeof user == "object" ? user.Username : user;
    },

    GetURL: (user: User | string) => {
        let username = avatar.GetNick(user);

        let result = database.GetQuery(`SELECT * FROM avatars WHERE username=${SQLSafe(username)};`);

        let color = result ? result.avatarURI : avatar.Add(username);

        return `https://eu.ui-avatars.com/api/?background=${color}&name=${username}&color=FFFFFF`;
    }
};

export default avatar;