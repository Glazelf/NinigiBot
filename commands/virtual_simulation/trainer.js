
const replaceDiscordEmotes = require('../../util/trophies/replaceDiscordEmotes')
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const userApi = require('../../database/dbServices/user.api');
        const shinxApi = require('../../database/dbServices/shinx.api');

        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
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

                embed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setThumbnail(avatar)
                    .addField("Balance:", user.money.toString(), true)
                    .addField("Food:", user.food.toString(), true);
                if (trophy_string.length > 0) {
                    embed
                        .addField("Trophy Level:", trophy_level + " :beginner", true)
                        .addField("Trophies:", trophy_string, true);
                };
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    embeds: [embed],
                    ephemeral: ephemeral
                });
            case "swapsprite":
                const shinx = await shinxApi.getShinx(master.id);
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: `Your character is now ${shinx.swapAndGetTrainerGender() ? 'male' : 'female'}, ${master}!`
                });
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
        type: "SUB_COMMAND",
        description: "Check your trainer stats!",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "swapsprite",
        type: "SUB_COMMAND",
        description: "Swap your trainer sprite between Dawn and Lucas."
    }]
};