import Discord from "../discord";
import Cooldown from "../../cooldown";
import Database from "../../database";
import { GetUserByToken, CloseJSON, Close } from "../../utils";
import secret from "../../../config/secret.json";
import avatar from "../../avatar";

const database = new Database();
const cooldown = new Cooldown(10);

Discord.Initialize();

export default {
    "/discord/report": {
        method: "post",
        callback: (req, res) => {
            let user = GetUserByToken(req.body.token, database);

            if (!user)
                return;

            if (!cooldown.CanUse(user.ID))
                return CloseJSON(res, 401, `Новое сообщение можно писать раз в ${cooldown.Cooldown} секунд!`);

            let msg = req.body.msg;

            if (!msg || msg.length == 0)
                msg = "Не указано";

            fetch(secret.webhooks.reports, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    "embeds": [
                        {
                            "description": `☁️ **Сообщение**\n*${msg}*`,
                            "color": parseInt(avatar.GetColor(user.Username), 16),
                            "footer": {
                                "text": `${user.Username} (id ${user.ID})`
                            }
                        }
                    ],
                })
            });

            Close(res, 200);
        }
    }
};