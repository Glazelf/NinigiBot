exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let DefaultEmbedColor = globalVars.embedColor;

        // Split off command
        let role = args.find(element => element.name == "role").value;

        let user = interaction.user;

        // Author avatar
        let avatar = interaction.member.displayAvatarURL(globalVars.displayAvatarSettings);

        let roleEmbed = new Discord.MessageEmbed()
            .setFooter({ text: user.tag })
            .setTimestamp();

        // Role visuals
        let icon = role.iconURL(globalVars.displayAvatarSettings);
        let embedColor = role.hexColor;
        if (embedColor == "#000000") embedColor = globalVars.embedColor;

        // Member count
        let memberCount = interaction.guild.members.cache.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;

        // Properties
        let roleProperties = "";
        if (role.hoist) roleProperties = `${roleProperties}Sorted seperately\n`;
        if (role.mentionable) roleProperties = `${roleProperties}Can be mentioned\n`;
        if (role.managed) roleProperties = `${roleProperties}Managed by integration\n`;
        if (roleProperties.length == 0) roleProperties = "None";

        // Embed
        roleEmbed
            .setColor(embedColor)
            .setAuthor({ name: `${role.name} (${role.id})`, iconURL: avatar })
            .setThumbnail(icon)
            .addField("Role:", role.toString(), true)
            .addField("Color:", role.hexColor, true)
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