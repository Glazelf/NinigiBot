import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (client, interaction, ephemeral) => {
    try {
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
        let permissionString = "None";
        if (role.permissions.toArray().length > 0) permissionString = role.permissions.toArray().join(", ");
        if (permissionString.length > 1024) permissionString = `${permissionString.substring(0, 1021)}...`;
        // Embed
        let roleEmbed = new Discord.EmbedBuilder()
            .setColor(embedColor)
            .setTitle(role.name)
            .setThumbnail(icon)
            .setFooter({ text: role.id })
            .addFields([{ name: "Role:", value: role.toString(), inline: true }]);
        if (role.hexColor !== defaultColor) roleEmbed.addFields([{ name: "Color:", value: role.hexColor, inline: true }]);
        roleEmbed
            .addFields([
                { name: "Members:", value: memberCount.toString(), inline: true },
                { name: "Position:", value: role.rawPosition.toString(), inline: true },
                { name: "Properties:", value: roleProperties, inline: false },
                { name: "Permissions:", value: permissionString, inline: false }
            ]);
        return sendMessage({ client: client, interaction: interaction, embeds: roleEmbed, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
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