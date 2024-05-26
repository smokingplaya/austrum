import User from "../../../user/class/user";
import Database from "../../../database";
import { GetUser, SQLSafe } from "../../../utils";
import bans from "../../../bans/bans";
import Discord from "../../discord";
import { EmbedBuilder } from "discord.js";

const database = new Database();

export default {
    description: "Убирает блокировку с сайта",
    channel: 1235585426341888010,
    admin: true,
    arguments: [
        ["username", "Ник пользователя", true]
    ],
    execute: async (interaction, admin: User) => {
        const user = GetUser(SQLSafe(interaction.options.getString("username")), database);

        if (!user)
            return interaction.reply({ content: "Пользователь не был найден!", ephemeral: true });

        bans.Unban(user);

        const user_discord = Discord.GetUserDiscord(user);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Выдача разблокировки")
            .setDescription("**``Администратор``** " + admin.Username +
                " (<@" + interaction.user.id + ">)" +
                "\n ** ``Пользователь`` ** " + user.Username +
                (user_discord ? " (<@" + user_discord + ">)" : ""));

        await interaction.reply({ embeds: [embed] });
    }
};