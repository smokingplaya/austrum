import ShopItem from "./class/shopitem";
import User from "../user/class/user";
import { SQLSafe, GetTime } from "../utils";
import Database from "../database";
import logger from "../logger/class/logger";

const database = new Database();
database.CreateTable("purchases", {
    "id": "ID",
    "userID": "INTEGER NOT NULL",
    "itemID": "TEXT NOT NULL",
    "itemExpire": "INTEGER"
});

interface IShopItemsTable {
    [id: string]: ShopItem;
}

const month = 60 * 60 * 24 * 30;

let shop_items: IShopItemsTable = {};

export function Add(user: User, item: ShopItem, price: number = 0): number {
    let currentTime = GetTime();
    let prices = item.prices;
    let itemTime = price != 0 ? prices[price] ? price : Object.keys(prices).find(key => prices[key] === price) : 0;;
    const time = itemTime == 0 ? 0 : currentTime + (parseInt(itemTime) * month);

    console.log(`\ntime: ${time}\n item: ${itemTime}\ncurrent: ${currentTime}\n\n`);

    database.RunQuery(`INSERT INTO purchases(userID, itemID, itemExpire) VALUES(${SQLSafe(user.ID)}, ${SQLSafe(item.id)}, ${time})`);

    return time;
}

export function GetItems(): IShopItemsTable {
    return shop_items;
}

export function GetItem(id: string): ShopItem {
    return shop_items[id];
}

export function RegisterItem(id: string): ShopItem {
    let item = new ShopItem(id);

    shop_items[id] = item;

    return item;
}