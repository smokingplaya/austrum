import { EmbedBuilder } from "discord.js";
import User from "../../../user/class/user";
import { FormatTime, GetTime, GetUser, SQLSafe } from "../../../utils";
import { GetItem } from "../../../shop/shop";
import Database from "../../../database";
import products from "../../../products/products";
import Discord from "../../discord";

const database = new Database();

export default {
    description: "Выдает товар пользователю",
    channel: 1235585426341888010,
    admin: true,
    arguments: [
        ["username", "Ник пользователя", true],
        ["product", "Айди продукта", true],
        ["time", "Срок действия (цена на конкретный срок в рублях)", true, true]
    ],
    execute: async (interaction, admin: User) => {
        const user = GetUser(SQLSafe(interaction.options.getString("username")), database);

        if (!user)
            return interaction.reply({ content: "Пользователь не был найден!", ephemeral: true });

        const time_arg = interaction.options.getInteger("time");
        const time = (time_arg == 0 ? 0 : 60 * 60 * 24 * time_arg);
        const product_id = interaction.options.getString("product");

        if (!GetItem(product_id))
            return interaction.reply({ content: "Продукт не был найден!", ephemeral: true });

        if (user.HasItem(product_id))
            return interaction.reply({ content: "У этого пользователя уже есть этот продукт!", ephemeral: true });

        const product_time = products.Give(user, product_id, time_arg);

        const user_discord = Discord.GetUserDiscord(user);

        const t = FormatTime(product_time);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Выдача продукта")
            .setDescription("**``Администратор``** " + admin.Username +
                " (<@" + interaction.user.id + ">)" +
                "\n ** ``Пользователь`` ** " + user.Username +
                (user_discord ? " (<@" + user_discord + ">)" : "") +
                "\n**``Товар``** " + product_id +
                "\n**``Срок``** " + (time == 0 ? "Навсегда" : `до ${t.hours}:${t.minutes} - ${t.day}.${t.month}.${t.year}`));

        await interaction.reply({ embeds: [embed] });
    }
};