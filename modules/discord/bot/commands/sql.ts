import { EmbedBuilder } from "discord.js";
import Database from "../../../database";

const database = new Database();

export default {
    description: "Тестовая команда",
    channel: 1235585426341888010,
    admin: true,
    arguments: [
        ["example", "Делает магию", true]
    ],
    execute: async interaction => {
        const query = interaction.options.getString("example");

        try {
            const data = database.EveryQuery(query);

            let text = "";

            for (let i in data) {
                text += i + ":\n";

                let obj = data[i];
                for (let field in obj) {
                    text += "\t" + field + ": " + obj[field] + "\n";
                }
            }

            if (text.length == 0)
                text = "null";

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle("Запрос выполнен успешно")
                .setDescription("Данные:\n```" + text + "\n```");
            await interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Произошла ошибка при выполнении SQL запроса!")
                .setDescription("Ошибка:\n```\n" + err + "\n```");

            await interaction.reply({ embeds: [embed] });
        }
    }
};