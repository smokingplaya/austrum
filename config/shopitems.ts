import products from "../modules/products/products";
import User from "../modules/user/class/user";
import Discord from "../modules/discord/discord";
import discord from "./discord.json";
import statistic from "../modules/statistic/statistic";

let items = {
    //"testitem": {
    //  "name": "Заголовок товара",
    //  "popular": false, // добавляет на странице /shop табличку, где написано что товар является популярным
    //  "desc": ["", "", ""] // галочки на странице /shop
    //  "price": 0, // цена товара в рублях
    //  "prices": [
    //    "0": 259, // навсегда 259р
    //    "1": 20 // на 1 месяц 20р
    //  ], // цены/сроки
    //  "onbuy": (user: User, order: object) => {} // функция, вызываемая при покупке предмета
    //  "check": (user: User) => {} // функция, показывающая, может ли user купить предмет. При true - не может, при false - может
    //  "discord": (user: User) => {} // функция, вызываемая при привязке дискорда
    //}

    "visuals": {
        "name": "Zeta Visuals Premium",
        "popular": true,
        "desc": ["Вы получите доступ к Zeta Visuals Premium", "При привязанном дискорд-аккаунте вам будет выдана роль \"Премиум\" на нашем дискорд сервере."],
        "prices": {
            "0": 449,
            "1": 189,
            "3": 299
        },
        "onbuy": (user, order) => {
            products.Give(user, "visuals", order.price);
            statistic.Plus("premium");
        },
        "check": user => { return user.HasItem("premium"); },
        "discord": user => Discord.GiveRole(user, discord.groups.premium),
        "discord_remove": user => Discord.RemoveRole(user, discord.groups.premium),
        "checkFailedMsg": "У вас уже куплен Premium!"
    },

    "hwid": {
        "name": "Сброс HWID",
        "desc": ["С вашего аккаунта будет удалён привязанный HWID"],
        "price": 100,
        "onbuy": user => user.EraseHWID(),
        "checkFailedMsg": "К вашему аккаунту не привязан HWID.",
        "check": user => { return user.HWID() == null; }
    },

    "visuals_prime": {
        "name": "Zeta Visuals Prime",
        "desc": ["На ваш аккаунт будет выдан статус Prime.", "При привязанном дискорд-аккаунте вам будет выдана роль \"Прайм\" на нашем дискорд сервере.", "Вы получите доступ к эксклюзивным новостям специально для Prime в нашем дискорд сервере"],
        "price": 129,
        "onbuy": user => products.Give(user, "visuals_prime"),
        "checkFailedMsg": "У вас уже есть прайм, либо у вас не привязан дискорд.",
        "check": (user: User) => {
            return !(user.HasItem("visuals_prime") && Discord.IsLinkedUser(user));
        }
    }
};

export default items;