import groups from "../../../../config/groups.json";
import User from "../../../user/class/user";
import { GetUser, SQLSafe } from "../../../utils";
import Database from "../../../database";

const database = new Database();

export default {
    description: "Обновляет роль пользователя на сайте",
    channel: 1235585426341888010,
    admin: true,
    arguments: [
        ["username", "Ник пользователя на сайте", true],
        ["role", "Новая роль пользователя на сайте", true]
    ],
    execute: async (interaction, admin: User) => {
        const user = GetUser(SQLSafe(interaction.options.getString("username")), database);

        if (!user)
            return interaction.reply({ content: "Пользователь не был найден!", ephemeral: true });

        const role = interaction.options.getString("role");

        if (!role || !groups.groups[role])
            return interaction.reply({ content: "Роль не была найдена!", ephemeral: true });

        user.SetGroup(role);
    }
};