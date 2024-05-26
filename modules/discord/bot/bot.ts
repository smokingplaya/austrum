import discord, { SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { SplitFilename } from "../../utils";
import Discord from "../discord";
import products from "../../products/products";
import logger from '../../logger/class/logger';
import fs from "fs";
import path from "path";

const { Client, Routes, GatewayIntentBits, Collection, ActivityType } = discord;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations] });

const slashCommands = [];
client["slashCommands"] = new Collection();

/**
 * * Загрузка команд
*/

const commands = fs.readdirSync(path.join(__dirname, "commands"),);

commands.forEach((file) => {
    let file_options = SplitFilename(file);
    let command = file_options[0];

    if (file_options[1] != "ts")
        return;

    let command_data = require(path.join(__dirname, "commands", file)).default;

    if (!command_data)
        return logger.Error(`Command ${command} doesn't return anything!`);

    const data = new SlashCommandBuilder()
        .setName(command)
        .setDescription(command_data.description);

    let args = command_data.arguments;

    if (args) {
        for (let k in args) {
            let v = args[k];
            data[v[3] ? "addIntegerOption" : "addStringOption"](option => option.setName(v[0]).setDescription(v[1]).setRequired(v[2]));
        }
    }

    let callback: Function = async interaction => {
        if (command_data.channel && interaction.channelId != command_data.channel)
            return interaction.reply({ content: "Вы не можете использовать\nэту команду в этом канале!", ephemeral: true });

        if (command_data.admin) {
            const user = Discord.GetUserByDiscord(interaction.user.id);

            if (!user || !user.HasFlag("*"))
                return interaction.reply({ content: "Вы не можете использовать\nэту команду!", ephemeral: true });

            return command_data.execute(interaction, user);
        }

        command_data.execute(interaction);
    };

    client["slashCommands"].set(data.name, { data, callback });
    slashCommands.push(data.toJSON());
});

/**
 * * Как только бот будет полностью загружен
*/

client.once("ready", async () => {
    client.user.setPresence({ activities: [{ name: `zetaproduct.ru 💚`, type: ActivityType.Playing }], status: 'online' });

    logger.Info(`Bot logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(client.token);

    (async () => {
        try {
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: slashCommands },
            );
        } catch (error) {
            console.error(error);
        }
    })();
});

/**
 * * Функция, вызываемая при взаимодействии с ботом
*/

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const slashCommand = client["slashCommands"].get(interaction.commandName);

    if (!slashCommand) return;

    /**
     * проверка кэша
    */

    const { guild } = interaction;
    if (!guild.members.cache.has(interaction.user.id)) {
        await guild.members.fetch();
    }

    /**
     * пытаемся использовать команду
     */

    try {
        await slashCommand.callback(interaction);
    } catch (err) {
        await interaction.reply({ content: `An error has occured. ${err}`, ephemeral: true });
    }
});

export default client;