import client from "./bot/bot";
import { token_discord } from "../../config/secret.json";
import discord from "../../config/discord.json";
import logger from "../logger/class/logger";
import User from "../user/class/user";
import Database from "../database";
import hash from "../hash";
import { GetUser, SQLSafe } from "../utils";
import ShopItems from "../shop";

const database = new Database();
database.CreateTable("discord", {
    "username": "UniqueText",
    "discordID": "TEXT NOT NULL"
});

let links = {}; // коды для привязки

let Discord = {
    "CommandChannelID": 1145149390936350760,

    Initialize: () => {
        logger.Info("Starting Discord bot");
        client.token = token_discord;
        client.login(client.token);
    },

    GetLinks: () => links,

    RemoveFromLinks: (id: string) => {
        delete links[id];
    },

    Link: (user: User, discordID: string | number) => {
        database.RunQuery(`INSERT INTO discord VALUES(${SQLSafe(user.Username)}, ${SQLSafe(discordID)})`);
    },

    IsLinkedUser: (user: User): boolean => {
        return database.GetQuery(`SELECT * FROM discord WHERE username=${SQLSafe(user.Username)}`) != null;
    },

    IsLinked: (id: string | number): boolean => {
        return database.GetQuery(`SELECT * FROM discord WHERE discordID=${SQLSafe(id)}`) != null;
    },

    GetUserByDiscord: (id: string): User => {
        const username = database.GetQuery(`SELECT * FROM discord WHERE discordID=${SQLSafe(id)}`).username;

        if (!username)
            return;

        return GetUser(SQLSafe(username), database);
    },

    GetUserByCode: (code: string): User => {
        let username = links[code];

        if (!username)
            return;

        let user = GetUser(SQLSafe(username), database);

        return user;
    },

    GetUserDiscord: (user: User): number => {
        let q = database.GetQuery(`SELECT * FROM discord WHERE username=${SQLSafe(user.Username)}`);

        return q ? q.discordID : undefined;
    },

    GetUserCode: (user: User): string => {
        let code = hash.SHA256(user.Username + user.ID + user.Email).substring(1, 9);

        links[code] = user.Username;

        return code;
    },

    GiveRole: async (user: User, role_id: string) => {
        const guild = client.guilds.cache.get(discord.server_id);

        if (!guild)
            return;

        let id = Discord.GetUserDiscord(user);

        if (!id)
            return;

        const role = guild.roles.cache.find(role => role.id == role_id);
        const user_ = await guild.members.fetch(id);

        if (!user_ || !role)
            return;

        if (!user_.roles.cache.has(role_id)) {
            user_.roles.add(role);
        }
    },

    HasRole: async (user: User, role_id: string): Promise<boolean> => {
        const guild = client.guilds.cache.get(discord.server_id);

        if (!guild)
            return false;

        let id = Discord.GetUserDiscord(user);

        if (!id)
            return false;

        const user_ = await guild.members.fetch(id);

        if (!user_)
            return false;

        return user_.roles ? user_.roles.cache.has(role_id) : false;
    },

    RemoveRole: async (user: User, role_id: string) => {
        const guild = client.guilds.cache.get(discord.server_id);

        if (!guild)
            return;

        let id = Discord.GetUserDiscord(user);

        if (!id)
            return;

        const role = guild.roles.cache.find(role => role.id == role_id);
        const user_ = await guild.members.fetch(id);

        if (!user_ || !role)
            return;

        if (user_.roles.cache.has(role_id)) {
            user_.roles.remove(role);
        }
    },

    // Мне нужно чтобы при UpdateUser
    // Проверялись все существующие роли

    UpdateUser: (user?: User) => {
        let discord_id = Discord.GetUserDiscord(user);

        if (!discord_id)
            return;

        for (let id in ShopItems) {
            let item = ShopItems[id];

            if (!item.OnDiscord || !user.HasItem(id))
                continue;

            item.OnDiscord(user, discord_id);
        }
    }
};

export default Discord;