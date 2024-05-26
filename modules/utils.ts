import User from "./user/class/user";
import Database from "./database";
import secret from "../config/secret.json";
import fs from "fs";

const recaptcha_key = secret.recaptcha.server;

/***
 * **Captcha**
 * * Считывает recaptcha-response из body, и проверяет на валидность
 * @param req - Request (запрос) express.js
 * @returns Promise<boolean>
*/
export async function Captcha(req: any): Promise<boolean> {
    const body = req.body;

    if (!body || !body.hasOwnProperty("g-recaptcha-response"))
        return false;

    const recaptcharesp = body["g-recaptcha-response"];
    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + recaptcha_key + "&response=" + recaptcharesp + "&remoteip=" + req.ip;
    const response = await fetch(verificationURL);
    const response_body = JSON.parse(await response.text());

    return response_body.success;
};

/***
 * **Close**
 * * Закрывает HTTP соединение
 * @param res - Response (ответ) express.js
 * @param code - HTTP код ответа сервера
 * @param message - Сообщение закрытия
*/
export function Close(res: any, code: number, message: unknown = "") {
    if (res._alreadyClosed)
        return;

    res._alreadyClosed = true;
    res.status(code);

    if (typeof message === "string")
        return res.send(message);

    res.end();
};

/***
 * **CloseJSONObject**
 * * Закрывает HTTP соединение, отвечая кастомным JSON объектом.
 * @param res - Response (ответ) express.js
 * @param code - HTTP код ответа сервера
 * @param obj - JSON-объект
*/
export function CloseJSONObject(res: any, code: number, obj: object | String[]) {
    if (res._alreadyClosed)
        return;

    res._alreadyClosed = true;

    res.status(code).json(obj);
};

/***
 * **CloseJSON**
 * * Закрывает HTTP соединение, отвечая JSON объектом с текстом.
 * @param res - Response (ответ) express.js
 * @param code - HTTP код ответа сервера
 * @param message - Текст в JSON-объекте
 * @param keyName - Ключ JSON-объекта
*/
export function CloseJSON(res: any, code: number, message: string, keyName: string = "msg") {
    let jsonResponse = {};
    jsonResponse[keyName] = message;

    CloseJSONObject(res, code, jsonResponse);
};

/***
 * **FileExists**
 * * Проверяет, существует ли файл
 * @param path - Путь до файла
 * @returns boolean
*/
export function FileExists(path: string): boolean {
    try {
        fs.accessSync(path, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
};

/***
 * **SQLSafe**
 * * Делает строку безопасной для SQL запроса
 * @param query - Данные, которые будут обработаны
 * @returns string
*/
export function SQLSafe(query: string | number, bNoQuotes: Boolean = false): string {
    if (!query)
        return "''";

    if (typeof query !== "string")
        return `${query}`;

    query = query.replace(/'/g, "''");

    const null_chr: number = query.indexOf("\0");
    if (null_chr !== -1) {
        query = query.substring(0, null_chr);
    }

    return bNoQuotes ? `${query}` : `'${query}'`;
};

export function SQLSafeObject(obj: Object): Object {
    let saveObject: Object = structuredClone(obj);

    for (let k in obj) {
        if (!obj.hasOwnProperty(k))
            continue;

        saveObject[k] = SQLSafe(obj[k]);
    }

    return saveObject;
};

export function GetUser(username: string, database: Database, table: string = "users", column: string = "username", res?: any): User {
    let result = database.GetQuery(`SELECT * FROM ${table} WHERE ${column}=${(username)};`);

    if (result == null || result == undefined) {
        if (res)
            CloseJSON(res, 401, "Пользователь не был найден");

        return;
    }

    return new User(result);
};

export function GetUserByCookie(req: object, res: object, database: Database): User {
    let cookie = req["headers"]["cookie"];

    if (!cookie)
        return;

    let cookie_token = cookie.match(/token=([^;]+)/);

    if (!cookie_token || !cookie_token[1])
        return;

    let user = database.GetQuery(`SELECT * FROM tokens WHERE token=${SQLSafe(cookie_token[1])}`);

    if (!user)
        return;

    return GetUserByToken(cookie_token[1], database);
}

export function GetUserByToken(token: string, database: Database): User {
    let user = database.GetQuery(`SELECT * FROM tokens WHERE token=${SQLSafe(token)}`);

    if (!user)
        return;

    return GetUser(SQLSafe(user.username), database, "users", "username");
}

export function TryToGet(data: string, database: Database, table: string, column: string = "username"): unknown {
    let result = database.GetQuery(`SELECT * FROM ${table} WHERE ${column}=${data};`);

    return result ? result : false;
};

export function ValidateData(data: Object, where: Array<string>): Boolean {
    let result: Boolean = true;

    where.forEach(element => {
        if (!data.hasOwnProperty(element as PropertyKey))
            return result = false;
    });

    return result;
};

// короче ебать, я эту хуйню написал, но я чет нихуя не вдупляю как она работает xd
// upd: вдуплил
export function SQLUpdateInsert(database: Database, table: string, key: string, value: string, k: string, v: string) {
    let saveValue = SQLSafe(value);
    let saveV = SQLSafe(v);

    let has = database.GetQuery(`SELECT * FROM ${table} WHERE ${key}=${saveValue}`);

    if (has)
        return database.RunQuery(`UPDATE ${table} SET ${k}=${saveV} WHERE ${key}=${saveValue}`);

    database.RunQuery(`INSERT INTO ${table}(${key}, ${k}) VALUES(${saveValue}, ${saveV})`);
};

export function GenerateNumber(): Number {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
};

// енто работаид если
export function FormatTime(time?: number, coef: number = 1000) {
    let timeDate = time ? new Date(Math.floor(time * coef)) : new Date();

    const hours = timeDate.getHours().toString().padStart(2, "0");
    const minutes = timeDate.getMinutes().toString().padStart(2, "0");
    const seconds = timeDate.getSeconds().toString().padStart(2, "0");
    const day = timeDate.getDate().toString().padStart(2, "0");
    const month = (timeDate.getMonth() + 1).toString().padStart(2, "0");
    const year = timeDate.getFullYear().toString();

    return { hours, minutes, seconds, day, month, year };
};

/**
 * * GetTime
 * @returns Current UNIX Time in seconds (not in ms)
 */

export function GetTime(): number {
    return Math.floor(new Date().valueOf() / 1000);
};

export function ArrayToString(array: Array<string>, seperator: string = " "): string {
    let res = "";
    let len = array.length;

    array.forEach((str, i) => {
        res += str + (i + 1 == len ? "" : seperator);
    });

    return res;
};

export function GetFileFromPath(path: string) {
    for (let i = path.length - 1; i >= 0; i--) {
        let c = path.charAt(i);
        if (c === "/" || c === "\\") return path.substring(i + 1);
    }

    return path;
}

export function SplitFilename(filename) {
    return filename.split(".");
}