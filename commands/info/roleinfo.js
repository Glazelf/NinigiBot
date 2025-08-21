import {
    InteractionContextType,
    EmbedBuilder,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandRoleOption,
    Constants // FIXME: guess on usage
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    let role = interaction.options.getRole("role");
    let memberListBool = interaction.options.getBoolean("memberlist");
    // Role visuals
    let icon = role.iconURL(globalVars.displayAvatarSettings);
    let defaultColors = { primaryColor: 0, secondaryColor: 0 }; // FIXME: check defaults
    let embedColor = role.colors.primaryColor;
    if (role.colors == defaultColors) embedColor = globalVars.embedColor;

    let guildMembers = await interaction.guild.members.fetch().catch(e => { return null; });
    if (!guildMembers) return;

    let roleMembersString = "";
    let roleMembers = guildMembers.filter(member => member.roles.cache.get(role.id));
    if (memberListBool === true) {
        for (const [id, member] of roleMembers) {
            let stringAddition = member.toString();
            if (roleMembersString.length > 0) stringAddition = `, ${member}`;
            if (roleMembersString.length + stringAddition.length < 1021) { // Limit is 1024, 1021 used so that dots in else statement always fit
                roleMembersString += stringAddition;
            } else {
                roleMembersString += "...";
                break;
            };
        };
    };
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
    // Info field
    let infoString = `Role: ${role}`;
    if (role.colors !== defaultColors) {
        if (role.colors == Constants.HolographicStyle) {
            infoString += `\nColor: Holographic`;
        } else {
            infoString += `\nColors: ${role.colors.primaryColor} & ${role.colors.secondaryColor}`;
        };
    };
    if (memberListBool !== true) infoString += `\nMembers: ${roleMembers.size}`;
    infoString += `\nPosition: ${role.rawPosition}`;
    // Embed
    let roleEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(role.name)
        .setDescription(infoString)
        .setThumbnail(icon)
        .setFooter({ text: `ID: ${role.id}` });
    roleEmbed.addFields([{ name: "Permissions:", value: permissionString, inline: false }]);
    if (memberListBool === true) roleEmbed.addFields([{ name: `Members: (${roleMembers.size})`, value: roleMembersString, inline: false }]);
    return sendMessage({ interaction: interaction, embeds: roleEmbed, flags: messageFlags });
};

// Role options
const roleOption = new SlashCommandRoleOption()
    .setName("role")
    .setDescription("Specify a role.")
    .setRequired(true);
// Boolean options
const memberListOption = new SlashCommandBooleanOption()
    .setName("memberlist")
    .setDescription("Display list of members.");
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Displays info about a role.")
    .setContexts([InteractionContextType.Guild])
    .addRoleOption(roleOption)
    .addBooleanOption(memberListOption)
    .addBooleanOption(ephemeralOption);