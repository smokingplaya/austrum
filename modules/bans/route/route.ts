import Database from "../../database";
import * as utils from "../../utils";
import bans from "../bans";

const database = new Database();

const bans_fields = ["reason"];

export default {
    "/bans/add": {
        method: "post",
        callback: (req: any, res: any) => {
            let body = utils.SQLSafeObject(req.body);
            let user = utils.GetUserByToken(req.body["token"], database);
            let ban_user = body["user"];

            if (!user || !ban_user)
                return utils.Close(res, 401);

            if (!utils.ValidateData(body, bans_fields))
                return utils.CloseJSON(res, 401, "Указаны не все параметры.");

            if (!user.HasFlag("a"))
                return utils.Close(res, 403);

            let found_user = utils.GetUser(ban_user, database, "users", "id", res);

            if (!found_user)
                return utils.Close(res, 401);

            bans.Give(found_user, req.body["reason"], parseInt(req.body["unban_time"]), user);

            utils.Close(res, 200);
        }
    }
};