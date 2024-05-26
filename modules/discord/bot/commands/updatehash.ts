import products from "../../../products/products";
import Loader from "../../../loader/class/loader";
import User from "../../../user/class/user";

export default {
    description: "Делает обновление хэш сумм",
    channel: 1235585426341888010,
    admin: true,
    execute: async interaction => {
        products.UpdateHash();

        Loader.CalcHash();

        await interaction.reply("Хэш-суммы были обновлены!");
    }
};