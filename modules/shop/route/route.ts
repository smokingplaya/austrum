import { Close, GenerateNumber, GetUser, GetUserByCookie, SQLSafe } from "../../utils";
import { GetItem } from "../shop";
import secrets from "../../../config/secret.json";
import items from "../../../config/shopitems";
import { YMNotificationChecker } from "yoomoney-sdk";
import ShopItem from "../class/shopitem";
import products from "../../products/products";
import Database from "../../database";
import User from "../../user/class/user";

const notificationChecker = new YMNotificationChecker(secrets.yoomoney.token);

const database = new Database();
let orders = new Map();

function GenerateOrderID() {
    const name = "order_" + GenerateNumber();

    if (orders.has(name))
        return GenerateOrderID(); // рекусрия, во избежание колизий

    return name;
}

export default {
    "/shop": {
        method: "get",
        callback: (_, res: any) => {
            res.render("shop", { i: items });
        }
    },

    "/shop/buy": {
        method: "post",
        callback: async (req, res) => {
            const type = req.body.t || 0; // 0,1,2,3 etc
            const item = req.body.i; // id предмета
            const promo = req.body.p; // zetaTOP

            const user = GetUserByCookie(req, res, database);

            const shopItem = GetItem(item);

            if (!user)
                return res.redirect("/login");

            if (!shopItem)
                return res.redirect("/profile");

            const order_id = GenerateOrderID();

            const url = await shopItem.Buy(user, type, req.ip, res, order_id, promo);

            if (!url)
                return Close(res, 200, "Вы не можете купить этот товар!");

            orders.set(order_id, { type: type, item: shopItem, user: user.Username });
        }
    },

    "/shop/success": {
        method: "get",
        callback: (_, res) => {
            Close(res, 200, "Спасибо за покупку.\nПроверьте ваш профиль.");
        }
    },

    // TODO
    "/shop/verify": {
        method: "post",
        callback: notificationChecker.middleware({ memo: false }, (req: any, res: any) => {
            const body = req.body;
            console.log("body", body);

            const label = body.label;

            if (!label || label.length < 4 || !orders.has(label))
                return Close(res, 401);

            const purchase_data = orders.get(label);

            console.log(label, orders);

            const type: number = purchase_data.type || 0;
            const item: ShopItem = purchase_data.item; // я долбаеб...
            const username: string = purchase_data.user;
            const user: User = GetUser(SQLSafe(username), database);

            if (!user)
                return Close(res, 401);

            item.OnBuy(user, {
                type: type
            });
            //products.Give(user, item.GetID(), type);

            orders.delete(label);

            fetch(secrets.webhooks.buy, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    "embeds": [
                        {
                            "title": "🦄  Новая покупка",
                            "description": `👩‍🦼 Пользователь ${username}\n🛸 купил себе ${item.GetName()}\n💵 за ${body.amount || "N/A"}р.`,
                            "footer": {
                                "text": `smokingplaya<3`
                            }
                        }
                    ],
                })
            });
        })
    }
};