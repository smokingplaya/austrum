import User from "./user/class/user";
import { BinaryLike } from "crypto";
import hash from "./hash";
import { SQLSafe, SQLUpdateInsert } from "./utils";
import Database from "./database";

const sessionTime = (60 * 60) * 12; // 12 часов

const database = new Database();
database.CreateTable("tokens", {
    "username": "TEXT NOT NULL UNIQUE",
    "token": "UniqueText"
});

let jwt = {
    GetTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    },

    Base64: (data: string): string => {
        return new Buffer(data).toString("base64");
    },

    Generate: (user: User, req: Object = { ip: "0.0.0.0" }): string => {
        let result = database.GetQuery(`SELECT token FROM tokens WHERE username=${SQLSafe(user.Username)};`);

        if (result && result.token && jwt.IsValid(result.token))
            return result.token;

        let currentTime = jwt.GetTimestamp();
        let necessaryInfo = { id: user.ID, username: user.Username, ip: req["ip"], exp: currentTime + sessionTime, nbf: currentTime };

        let header: string = jwt.Base64('{"alg":"HS256","typ":"JWT"}');
        let payload: string = jwt.Base64(JSON.stringify(necessaryInfo));
        let signature: string = hash.HMACSHA256(payload as BinaryLike);

        let token: string = `${header}.${payload}.${signature}`;

        SQLUpdateInsert(database, "tokens", "username", user.Username, "token", token);

        return token;
    },

    Get: (user: User, req?: any): string => {
        let data = database.GetQuery(`SELECT * FROM tokens WHERE username=${SQLSafe(user.Username)};`);

        if (!data || !data.token || !jwt.IsValid(data.token))
            return jwt.Generate(user, req);

        return data.token;
    },

    DecodePayload: (payload: string): object => {
        return JSON.parse(Buffer.from(payload, 'base64').toString());
    },

    IsValid: (token: string): boolean => {
        let parts = token.split(".");

        if (!(parts.length === 3))
            return false;

        let payload = parts[1];
        let signature = parts[2];

        if (hash.HMACSHA256(payload) != signature)
            return false;

        let decoded = jwt.DecodePayload(payload); // TODO: CHECK IP (decoded.ip)

        let currentTime = jwt.GetTimestamp();

        if (currentTime > (decoded["exp"] ? decoded["exp"] : 0) || currentTime < (decoded["nbf"] ? decoded["nbf"] : 0))
            return false;

        return true;
    },

    CheckRequest: (req: any): boolean => {
        let auth_header = req.headers.authorization;

        if (!auth_header)
            return false;

        if (auth_header.substr(0, 5).toLowerCase() != "basic")
            return false;

        return jwt.IsValid(auth_header.substr(6, auth_header.length - 6));
    }
};

export default jwt;