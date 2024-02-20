
const replaceDiscordEmotes = require('../../util/trophies/replaceDiscordEmotes');
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const userApi = require('../../database/dbServices/user.api');
        const shinxApi = require('../../database/dbServices/shinx.api');

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        let embed;
        let avatar = null;
        let master = interaction.user;
        let user, trophies;
        switch (interaction.options.getSubcommand()) {
            case "info":
                user = await userApi.getUser(master.id);
                let member = await interaction.guild.members.fetch(master.id);
                if (member) avatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
                trophy_level = 0;
                trophies = await user.getShopTrophies();
                trophy_string = '';
                trophies.forEach(trophy => {
                    trophy_string += (trophy.icon + ' ');
                });
                trophy_level += trophies.length;
                trophies = await user.getEventTrophies();

                trophies.forEach(trophy => {
                    trophy_string += (trophy.icon + ' ');
                });
                trophy_level += trophies.length;
                if (!emotesAllowed) trophies = replaceDiscordEmotes(trophies);

                embed = new Discord.EmbedBuilder()
                    .setColor(globalVars.embedColor)
                    .setThumbnail(avatar)
                    .addField("Balance:", user.money.toString(), true)
                    .addField("Food:", user.food.toString(), true);
                if (trophy_string.length > 0) {
                    embed
                        .addField("Trophy Level:", trophy_level + " :beginner", true)
                        .addField("Trophies:", trophy_string, true);
                };
                return sendMessage({ client: client, interaction: interaction, embeds: [embed], ephemeral: ephemeral });
            case "swapsprite":
                const shinx = await shinxApi.getShinx(master.id);
                return sendMessage({ client: client, interaction: interaction, content: `Your character is now ${shinx.swapAndGetTrainerGender() ? 'male' : 'female'}, ${master}!` });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "trainer",
    description: "Check your trainer stats.",
    options: [{
        name: "info",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Check your trainer stats!",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "swapsprite",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Swap your trainer sprite between Dawn and Lucas."
    }]
};