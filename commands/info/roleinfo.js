exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let DefaultEmbedColor = globalVars.embedColor;

        let role = args.find(element => element.name == "role").role;
        let user = interaction.user;
        let avatar = interaction.member.displayAvatarURL(globalVars.displayAvatarSettings);

        // Role visuals
        let icon = role.iconURL(globalVars.displayAvatarSettings);
        let defaultColor = "#000000";
        let embedColor = role.hexColor;
        if (embedColor == defaultColor) embedColor = globalVars.embedColor;

        let memberCount = interaction.guild.members.cache.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;

        // Properties
        let roleProperties = "";
        if (role.hoist) roleProperties = `${roleProperties}Sorted seperately\n`;
        if (role.mentionable) roleProperties = `${roleProperties}Can be mentioned\n`;
        if (role.managed) roleProperties = `${roleProperties}Managed by integration\n`;
        if (roleProperties.length == 0) roleProperties = "None";

        // Embed
        let roleEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setAuthor({ name: `${role.name} (${role.id})`, iconURL: avatar })
            .setThumbnail(icon)
            .addField("Role:", role.toString(), true);
        if (role.hexColor !== defaultColor) roleEmbed.addField("Color:", role.hexColor, true);
        roleEmbed
            .addField("Members:", memberCount.toString(), true)
            .addField("Position:", role.rawPosition.toString(), true)
            .addField("Properties:", roleProperties, false);

        return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roleinfo",
    description: "Sends info about a role.",
    options: [{
        name: "role",
        type: "ROLE",
        description: "Specify role.",
        required: true
    }]
};