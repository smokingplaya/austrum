import { EmbedBuilder } from "discord.js";
import bans from "../../../bans/bans";
import User from "../../../user/class/user";
import Database from "../../../database";
import { FormatTime, GetTime, GetUser, SQLSafe } from "../../../utils";
import Discord from "../../discord";

const database = new Database();

export default {
    description: "Блокирует пользователя на сайте",
    channel: 1235585426341888010,
    admin: true,
    arguments: [
        ["username", "Ник пользователя", true],
        ["reason", "Причина блокировки", true],
        ["time", "Время блокировки (в днях)", true, true]
    ],

    execute: async (interaction, admin: User) => {
        const user = GetUser(SQLSafe(interaction.options.getString("username")), database);

        if (!user)
            return interaction.reply({ content: "Пользователь не был найден!", ephemeral: true });

        const time_arg = interaction.options.getInteger("time");
        const time = (time_arg == 0 ? 0 : 60 * 60 * 24 * time_arg);
        const reason = interaction.options.getString("reason");

        bans.Give(user, reason, time, admin);

        const user_discord = Discord.GetUserDiscord(user);
        const t = FormatTime(GetTime() + time);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Выдача блокировки")
            .setDescription("**``Администратор``** " + admin.Username +
                " (<@" + interaction.user.id + ">)" +
                "\n ** ``Пользователь`` ** " + user.Username +
                (user_discord ? " (<@" + user_discord + ">)" : "") +
                "\n**``Причина``** " + reason +
                "\n**``Время разблокировки``** " + (time == 0 ? "Пермамент" : `${t.hours}:${t.minutes} - ${t.day}.${t.month}.${t.year}`));

        await interaction.reply({ embeds: [embed] });
    }
};