const shop = require("./shop/shop");
const items = require("../config/shopitems.js").default;

let ShopItems = {};

// item - key; item_body - value
for (let item in items) {
    let item_body = items[item];

    let registredItem = shop.RegisterItem(item);
    registredItem.SetName(item_body.name);

    if (item_body.prices) {
        registredItem.SetPrices(item_body.prices);
    } else {
        registredItem.SetPrice(item_body.price);
    }

    registredItem.SetDesc(item_body.desc);

    if (item_body.onbuy)
        registredItem.SetOnBuy(item_body.onbuy);

    registredItem.SetCheck(() => { return true; });

    if (item_body.check)
        registredItem.SetCheck(item_body.check);

    if (item_body.discord)
        registredItem.SetDiscord(item_body.discord);

    if (item_body.discord_remove)
        registredItem.SetDiscordRemover(item_body.discord_remove);

    ShopItems[item] = registredItem;
}

export default ShopItems;