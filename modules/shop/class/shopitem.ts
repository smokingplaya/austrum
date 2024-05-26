import User from "../../user/class/user";
import secrets from "../../../config/secret.json";
import { Get } from "../../promocodes/promocodes";
import { YMPaymentFromBuilder, YMFormPaymentType } from "yoomoney-sdk";

export default class ShopItem {
    id: string;
    name: string = "";
    desc: string = "";
    price: number = 0;
    prices: { [id: number]: number; } = {};
    onbuy: (user: User, order: object) => void = () => { };
    discord: (user: User, id: string) => void = () => { };
    discord_remove: (user: User, id: string) => void = () => { };
    check: (user: User) => boolean = () => { return false; };

    constructor(id: string) {
        this.id = id;
    }

    SetName(name: string): ShopItem {
        this.name = name;

        return this;
    }

    SetDesc(desc: string): ShopItem {
        this.desc = desc;

        return this;
    }

    SetPrice(price: number): ShopItem {
        this.price = price;

        return this;
    }

    SetPrices(prices: { [id: number]: number; }): ShopItem {
        this.prices = prices;

        return this;
    }

    SetOnBuy(callback: (user: User) => void): ShopItem {
        this.onbuy = callback;

        return this;
    };

    SetDiscord(callback: (user: User) => boolean): ShopItem {
        this.discord = callback;

        return this;
    }

    SetDiscordRemover(callback: (user: User) => boolean): ShopItem {
        this.discord_remove = callback;

        return this;
    }

    SetCheck(callback: (user: User) => boolean): ShopItem {
        this.check = callback;

        return this;
    }

    OnBuy(user: User, order: object) {
        this.onbuy(user, order);
    }

    OnDiscord(user: User, id: string) {
        this.discord(user, id);
    }

    OnDiscordRemove(user: User, id: string) {
        this.discord_remove(user, id);
    }

    Buy(user: User, type: string, ip: string, res, id: string, promocode?: string): boolean {
        if (this.Check(user))
            return false;

        const item_price = Object.keys(this.prices).length == 0 ? this.GetPrice() : this.prices[type];

        const price = Math.ceil(item_price * Get(promocode));

        const builder = new YMPaymentFromBuilder({
            quickPayForm: "shop",
            needEmail: true,
            sum: price,
            targets: "hello",
            successURL: `https://zetaproduct.ru/shop/success`,
            paymentType: YMFormPaymentType.FromCard,
            receiver: secrets.yoomoney.receiver_card,
            label: id,
            comment: "Покупка " + this.GetName()
        });

        res.writeHead(200, "OK", {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(builder.buildHtml(true));

        return true;
    }

    Check(user: User): boolean {
        return this.check(user);
    }

    GetID(): string {
        return this.id;
    }

    // Get Methods

    GetName(): string {
        return this.name;
    }

    GetDesc(): string {
        return this.desc;
    }

    GetPrice(): number {
        return this.price;
    }

    GetPrices(): { [id: number]: number; } {
        return this.prices;
    }
}