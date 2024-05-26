import Discord from "../../discord";

export default {
    description: "Привязывает аккаунт сайта с дискорду",
    channel: 1145149390936350760,
    arguments: [
        ["profile_code", "Код из профиля сайта", true]
    ],
    execute: async interaction => {
        const code = interaction.options.getString("profile_code");

        const user_id = interaction.user.id;

        const user = Discord.GetUserByCode(code);

        if (!user)
            return await interaction.reply({ content: "Код для привязки не был найден.\nПопробуйте обновить свой профиль на сайте клавишей **``F5``**.", ephemeral: true });

        if (Discord.IsLinkedUser(user) || Discord.IsLinked(user_id))
            return await interaction.reply({ content: "Аккаунт уже привязан", ephemeral: true });

        Discord.Link(user, user_id);

        Discord.RemoveFromLinks(code);

        Discord.UpdateUser(user);

        return await interaction.reply({ content: `Ваш дискорд аккаунт был\nпривязан к пользователю **${user.Username}** [${user.ID}]`, ephemeral: true });
    }
};