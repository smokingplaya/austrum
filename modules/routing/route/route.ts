import Database from "../../database";
import path from "path";
import statistic from "../../statistic/statistic";
import { routing } from "../../../config/settings.json";
import { GetUserByCookie, FormatTime } from "../../utils";
import bans from "../../bans/bans";
import avatar from "../../avatar";
import settings from "../../../config/settings.json";
import groups from "../../../config/groups.json";
import shopitems from "../../../config/shopitems.js";
import Discord from "../../discord/discord";

const database = new Database();

const dir = path.join(__dirname, "../../../data/website");

function sendFile(res, fileName, next) {
    res.sendFile(fileName, { root: dir }, (err) => {
        if (err) {
            if (err.code === 'ENOENT')
                return next();

            res.status(err.status).end();
        }
    });
}

statistic.Register("premium");
statistic.Register("starts");
statistic.Register("downloads");

let admin_max = settings.admin_page.users_per_page;

let routes = {
    "/": {
        method: "get",
        callback: (_, res: any) => {
            res.render("index", { userCount: statistic.Get("usercount"), premium: statistic.Get("premium"), starts: statistic.Get("starts"), downloads: statistic.Get("downloads") });
        }
    },

    "/register": {
        method: "get",
        callback: (_, res: any) => {
            res.render("register", {});
        }
    },

    "/login": {
        method: "get",
        callback: (_, res: any) => {
            res.render("login", {});
        }
    },

    "/recovery": {
        method: "get",
        callback: (req: any, res: any) => {
            res.render("recovery", { t: req.query.t || "0" });
        }
    },

    "/users/:page": {
        method: "get",
        callback: (req: any, res: any) => {
            let user = GetUserByCookie(req, res, database);
            let page = req.params.page;

            if (!user || !user.HasFlag("m"))
                return res.redirect("/");

            let user_count = statistic.Get("usercount");

            if (user_count <= 1)
                return res.redirect("/");

            let mp = Math.ceil(user_count / admin_max);

            if (parseInt(page) < 1)
                return res.redirect("/users/1");

            if (parseInt(page) > mp)
                return res.redirect("/users/" + mp);

            let users = [];

            let user_list = database.EveryQuery("SELECT * FROM users WHERE id > " + ((page - 1) * admin_max) + " LIMIT " + admin_max);

            for (let i in user_list) {
                let user = user_list[i];
                user.avatar = avatar.GetURL(user.username);
                user.rank = groups.groups[user.rank].niceName;

                users.push(user);
            }

            res.render("users", { u: users, p: page, mp: mp, it: shopitems });
        }
    },

    "/users": {
        method: "patch",
        callback: (req, res) => {
            // TODO: ban/give role

            //Discord.UpdateUser(user);
        }
    },

    "/profile": {
        method: "get",
        callback: async (req: any, res: any) => {
            let user = GetUserByCookie(req, res, database);

            if (!user)
                return res.redirect("/login");

            Discord.UpdateUser(user);

            let response = {};
            response["blocked"] = user.Blocked;

            if (response["blocked"]) {
                let ban_data = bans.Get(user);

                if (!ban_data)
                    return res.redirect("/profile"); // редирект чтобы информация обновилась

                let bt = FormatTime(ban_data.ban_time);
                let ut = FormatTime(ban_data.unban_time);

                response["banreason"] = ban_data.reason;
                response["banadm"] = ban_data.adminName;
                response["bantime"] = `${bt.hours}:${bt.minutes}:${bt.seconds} - ${bt.day}.${bt.month}.${bt.year}`;
                response["unbantime"] = `${ut.hours}:${ut.minutes}:${ut.seconds} - ${ut.day}.${ut.month}.${ut.year}`;
            } else {
                let t = user.GetGroupExpire();
                let time = FormatTime(t);

                response["name"] = user.Username;
                response["id"] = user.ID;
                response["status"] = user.GetGroupName();
                response["discord"] = Discord.IsLinkedUser(user) ? 1 : 0;
                response["hwid"] = 0;
                response["statexpire"] = t == 0 ? "навсегда" : time.day + "." + time.month + "." + time.year;
                response["avatarURL"] = avatar.GetURL(user);
                response["hasvisuals"] = user.HasItem("visuals") ? 1 : 0;

                if (response["discord"] == 0)
                    response["code"] = Discord.GetUserCode(user);
            }

            res.render("profile", response);
        }
    },

    "/signout": {
        method: "get",
        callback: (req: any, res: any) => {
            res.set("Set-cookie", `token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`).redirect("/login");
        }
    },

    // data/website routing and other
    "/*": {
        method: "get",
        callback: (req: any, res: any, next: () => void) => {
            let fileName = req.params[0];

            if (routing.hasOwnProperty(fileName)) {
                if (typeof routing[fileName] !== "object")
                    return res.redirect("/404");

                if (routing[fileName].isURL)
                    return res.redirect(routing[fileName].path);

                return sendFile(res, routing[fileName].path, next);
            }

            return sendFile(res, fileName, next);
        }
    }
};

routes["/index"] = routes["/"];

export default routes;