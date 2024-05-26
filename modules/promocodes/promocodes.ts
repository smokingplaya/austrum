const promocodes = require("../../config/promocodes.json");

export function Get(name: string): number {
    let promo = promocodes[name];

    if (!promo)
        return 1;

    return (100 - promo) / 100;
}