import Database from "../../database";
import secret from "../../../config/secret.json";
import settings from "../../../config/settings.json";
import * as utils from "../../utils";
import hash from "../../hash";
import mail from "../../mail/mail";
import jwt from "../../jwt";
import statistic from "../../statistic/statistic";
import logger from "../../logger/class/logger";

const database = new Database();
const database_old = new Database("db.db");

database.CreateTable("users", {
    "id": "ID",
    "email": "UniqueText",
    "username": "UniqueText",
    "password": "TEXT NOT NULL",
    "rank": "TEXT NOT NULL",
    "blocked": "INTEGER NOT NULL"
});
database.CreateTable("hwids", {
    "username": "UniqueText",
    "hwid": "TEXT NOT NULL"
});

const safe = utils.SQLSafe;

statistic.Register("usercount");

const register_fields = ["email", "username", "password"];
const login_fields = ["username", "password"];
const data_fields = ["username", "password"];
const auth_fields = ["id", "token", "hwid"];
const allowed_emails_message = utils.ArrayToString(mail.GetAllowed(), ", ");
let registration_data = {};
let registration_emails = {};

function check_length(str: string, tab: { min: number; max: number; }): boolean {
    let len = str.length - 2;

    return tab.min > len || tab.max < len;
}

function login_redirect(res: any, token: string, page: string) {
    res.set("Set-cookie", `token=${token}; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT`).redirect(page);
}

export default {
    "/user/login": {
        method: "post",
        callback: async (req: any, res: any) => {
            let body = utils.SQLSafeObject(req.body);
            let username = body["username"];

            if (!await utils.Captcha(req))
                return utils.Close(res, 400);

            if (!utils.ValidateData(body, login_fields))
                return utils.CloseJSON(res, 401, "Указаны не все параметры.");

            let user = utils.GetUser(username, database, "users", "username", res);

            if (!user)
                return utils.CloseJSON(res, 401, "Пользователь не найден");

            let token = jwt.Get(user, req);

            if (user.Password === "" && hash.SHA256(req.body.password) == database_old.GetQuery(`SELECT pass FROM users WHERE nick=${safe(user.Username)}`).pass)
                return login_redirect(res, token, "/recovery?t=1");

            let password_hashed = hash.SHA512(secret.salt + req.body.password);

            if (password_hashed != user.Password)
                return utils.CloseJSON(res, 401, "Пароли не совпадают");

            res.set("Set-cookie", `token=${token}; path=/; expires=Tue, 19 Jan 2038 03:14:07 GMT`).redirect("/profile");
        }
    },

    "/user/register": {
        method: "post",

        callback: async (req: any, res: any) => {
            let body = utils.SQLSafeObject(req.body);
            let email = body["email"];
            let username = body["username"];

            if (!await utils.Captcha(req))
                return utils.Close(res, 400);

            if (!utils.ValidateData(body, register_fields))
                return utils.CloseJSON(res, 401, "Указаны не все параметры.");

            if (!mail.IsAllowed(req.body.email))
                return utils.CloseJSON(res, 401, `Ваш почтовый сервис не доступен для регистрации на нашем сайте. Список доступных: ${allowed_emails_message}`);

            if (check_length(body["username"], settings.limits.login))
                return utils.CloseJSON(res, 401, "Ваш логин слишком маленький/большой!");

            if (check_length(body["password"], settings.limits.password))
                return utils.CloseJSON(res, 401, "Ваш пароль слишком маленький/большой!");

            let data = utils.TryToGet(username, database, "users", "username");

            if (data)
                return utils.CloseJSON(res, 401, "Указанное имя пользователя уже занято.");

            data = utils.TryToGet(email, database, "users", "email");

            if (data)
                return utils.CloseJSON(res, 401, "Указанная почта уже занята.");

            const id = utils.GenerateNumber();

            registration_data[id.toString()] = { email: email, username: username, password: safe(hash.SHA512(secret.salt + req.body.password)) }; // typescript moment lmao
            registration_emails[email] = id;

            mail.Send(req.body.email, "registration", {
                "url": "https://zetaproduct.ru/user/register/verify?i=" + id
            });

            setTimeout(() => {
                delete registration_data[id.toString()];
                delete registration_emails[email];
            }, 5 * 60 * 1000);

            utils.CloseJSON(res, 200, "На вашу почту был отправлено письмо-подтверждение.");
        }
    },

    "/user/register/verify": {
        method: "get",
        callback: (req: any, res: any) => {
            let query = req.query;
            let id = query.i;
            let data = registration_data[id];

            if (!data)
                return utils.CloseJSON(res, 404, "Вас нет в списке на подтверждение регистрации.");

            database.RunQuery(`INSERT INTO users(email, username, password, rank, blocked) VALUES(${data["email"]}, ${data["username"]}, ${data["password"]}, "user", 0)`);

            delete registration_data[id.toString()];
            delete registration_emails[data["email"]];

            statistic.Plus("usercount");

            utils.CloseJSON(res, 200, "Успешная регистрация");
        }
    },

    // * API Method for loader

    "/user/data": {
        method: "post",
        callback: (req, res) => {
            let body = utils.SQLSafeObject(req.body);
            let username = body["username"];

            if (!utils.ValidateData(body, data_fields))
                return utils.CloseJSON(res, 401, "Вы ввели неверные данные!");

            let user = utils.GetUser(username, database, "users", "username", res);

            if (!user)
                return utils.CloseJSON(res, 401, "Пользователь не найден");

            let password_hashed = hash.SHA512(secret.salt + req.body.password);

            if (password_hashed != user.Password)
                return utils.CloseJSON(res, 401, "Пароли не совпадают");

            utils.CloseJSONObject(res, 200, {
                uuid: user.ID,
                hwid: user.HWID(),
                token: user.Token(),
            });
        }
    },

    // * API Method for Java class

    "/user/auth": {
        method: "post",
        callback: (req, res) => {
            let body = utils.SQLSafeObject(req.body);

            if (!utils.ValidateData(body, auth_fields))
                return utils.CloseJSON(res, 401, "Вы ввели неверные данные!");

            let user = utils.GetUserByToken(req.body["token"], database);

            if (!user)
                return utils.CloseJSON(res, 401, "Вы ввели неверные данные!");

            if (req.body["id"] != user.ID || (user.HWID() != null && req.body["hwid"] != user.HWID()))
                return utils.Close(res, 401);

            if (user.HWID() == null)
                user.SetHWID(req.body["hwid"]);

            statistic.Plus("starts");
            utils.Close(res, 200);
        }
    },

    "/user/recovery": {
        method: "post",
        callback: (req, res) => { } // TODO - восстановление пароля
    },

    "/user/passwordupdate": {
        method: "post",
        callback: (req, res) => {
            let user = utils.GetUserByCookie(req, res, database);

            if (!req.body["new_password"])
                return utils.CloseJSON(res, 400, "Необходимо указать новый пароль!");

            if (user.Password != "")
                return utils.CloseJSON(res, 400, "Вы не можете обновить пароль!");

            if (check_length(req.body.new_password, settings.limits.password))
                return utils.CloseJSON(res, 401, "Ваш пароль слишком маленький/большой!");

            database.RunQuery(`UPDATE users SET password=${safe(hash.SHA512(secret.salt + req.body.new_password))} WHERE username=${safe(user.Username)};`);

            utils.CloseJSON(res, 200, "Пароль был успешно обновлен!");
        }
    }

    //"/user/changepassword": {}
};