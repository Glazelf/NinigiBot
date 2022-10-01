const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        
        const permissionSerializer = require('../../util/permissionBitfieldSerializer');
        let DefaultEmbedColor = globalVars.embedColor;

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });
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
            .addField("Role:", role.toString(), true);
        if (role.hexColor !== defaultColor) roleEmbed.addField("Color:", role.hexColor, true);
        roleEmbed
            .addField("Members:", memberCount.toString(), true)
            .addField("Position:", role.rawPosition.toString(), true)
            .addField("Properties:", roleProperties, false)
            .addField("Permissions:", permissionString, false)
            .setFooter({ text: role.id });

        return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed });

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
    }]
};