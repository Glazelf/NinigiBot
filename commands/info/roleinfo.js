const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const permissionSerializer = require('../../util/permissionBitfieldSerializer');
        let DefaultEmbedColor = globalVars.embedColor;

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let role = interaction.options.getRole("role");
        // Role visuals
        let icon = role.iconURL(globalVars.displayAvatarSettings);
        let defaultColor = "#000000";
        let embedColor = role.hexColor;
        if (embedColor == defaultColor) embedColor = globalVars.embedColor;

        let guildMembers = await interaction.guild.members.fetch();
        let memberCount = guildMembers.filter(member => member.roles.cache.find(loopRole => loopRole == role)).size;
        // Properties
        let roleProperties = "";
        if (role.hoist) roleProperties = `${roleProperties}Sorted seperately\n`;
        if (role.mentionable) roleProperties = `${roleProperties}Can be mentioned\n`;
        if (role.managed) roleProperties = `${roleProperties}Managed by integration\n`;
        if (roleProperties.length == 0) roleProperties = "None";
        // Permissions
        const permissions = permissionSerializer(role.permissions);
        let permissionString = "None";
        if (permissions.length > 0) permissionString = permissions.join(", ");
        if (permissionString.length > 1024) permissionString = `${permissionString.substring(0, 1021)}...`;
        // Embed
        let roleEmbed = new Discord.EmbedBuilder()
            .setColor(embedColor)
            .setAuthor({ name: `${role.name}` })
            .setThumbnail(icon)
            .addFields([{ name: "Role:", value: role.toString(), inline: true }]);
        if (role.hexColor !== defaultColor) roleEmbed.addFields([{ name: "Color:", value: role.hexColor, inline: true }]);
        roleEmbed
            .addFields([
                { name: "Members:", value: memberCount.toString(), inline: true },
                { name: "Position:", value: role.rawPosition.toString(), inline: true },
                { name: "Properties:", value: roleProperties, inline: false },
                { name: "Permissions:", value: permissionString, inline: false }
            ])
            .setFooter({ text: role.id });
        return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "roleinfo",
    description: "Displays info about a role.",
    options: [{
        name: "role",
        type: Discord.ApplicationCommandOptionType.Role,
        description: "Specify role.",
        required: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};