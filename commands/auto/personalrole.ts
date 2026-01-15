import {
    MessageFlags,
    GuildFeature,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandAttachmentOption,
    inlineCode,
    Constants
} from "discord.js";
import logger from "../../util/logger.js";
import checkPermissions from "../../util/discord/perms/checkPermissions.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import deletePersonalRole from "../../util/db/deletePersonalRole.js";
import formatName from "../../util/discord/formatName.js";
import getBotSubscription from "../../util/discord/getBotSubscription.js";
import filterToAlphanumeric from "../../util/string/filterToAlphanumeric.js";
import numberToHex from "../../util/math/numberToHex.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const defaultColorStyle = { primaryColor: 0, secondaryColor: null };

export default async (interaction: any, messageFlags: any) => {
    messageFlags.add(MessageFlags.Ephemeral);
    let serverApi = await import("../../database/dbServices/server.api.js");
    serverApi = await serverApi.default();
    let adminBool = isAdmin(interaction.member);
    let modBool = checkPermissions({ member: interaction.member, permissions: [PermissionFlagsBits.ManageRoles] });
    // In theory this can proc for other integration roles but this is intended for Twitch/YouTube sub roles
    let integrationRoleBool = interaction.member.roles.cache.some(role => role.tags?.integrationId);
    let serverID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
    let guildNameFormatted = formatName(interaction.guild.name, true);
    if (!serverID) return sendMessage({ interaction: interaction, content: `Personal Roles are disabled in ${guildNameFormatted}.`, flags: messageFlags.add(MessageFlags.Ephemeral) });

    await interaction.deferReply({ flags: messageFlags });

    let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.user.id } });
    let colorArg = interaction.options.getString("color") || 0;
    let colorGradientArg = interaction.options.getString("color-gradient");
    let colorStyleArg = interaction.options.getString("color-style");
    let iconArg = interaction.options.getAttachment("icon");

    let roleColors = {};
    let iconImg = null;
    let deleteBool = false;
    let fileIsImg = false;
    let iconSize = 0;
    if (colorArg || colorGradientArg || colorStyleArg) {
        if (colorArg) colorArg = filterToAlphanumeric(colorArg).toLowerCase();
        if (colorGradientArg) colorGradientArg = filterToAlphanumeric(colorGradientArg).toLowerCase();
        roleColors = { primaryColor: colorArg, secondaryColor: colorGradientArg };
        if (colorStyleArg == "holographic") {
            roleColors.primaryColor = Constants.HolographicStyle.Primary;
            roleColors.secondaryColor = Constants.HolographicStyle.Secondary;
            roleColors.tertiaryColor = Constants.HolographicStyle.Tertiary;
        };
        if (colorStyleArg == "default") roleColors = defaultColorStyle;
    };
    if (iconArg) {
        // Object seems to be structured differently between ephemeral and public messages, or I may be stupid
        iconImg = iconArg.attachment.url;
        if (!iconImg) iconImg = iconArg.attachment;
        iconSize = Math.ceil(iconArg.attachment.size / 1000);
        if (iconArg.contentType.includes('image')) fileIsImg = true;
    };
    if (interaction.options.getSubcommand() == "delete") deleteBool = true;
    // Check if icons are possible
    let iconsAllowed = false;
    if (interaction.guild.features.includes(GuildFeature.RoleIcons)) iconsAllowed = true;
    // Get Nitro Booster position
    let boosterRole = await interaction.guild.roles.premiumSubscriberRole;
    if (!boosterRole) return sendMessage({ interaction: interaction, content: `${guildNameFormatted} does not have a Nitro Booster role. This role is created the first time someone boosts the server.` });
    let boosterBool = interaction.member.roles.cache.has(boosterRole.id);
    let personalRolePosition = boosterRole.position + 1;
    // Check SKU entitlement
    let botSubscriberBool = false;
    let botSubscription = await getBotSubscription(interaction.client.application, interaction.user.id);
    if (interaction.guild.id == globalVars.ShinxServerID && botSubscription.entitlement) botSubscriberBool = true;
    let isEligibleForPersonalRole = (boosterBool || modBool || adminBool || botSubscriberBool || integrationRoleBool);
    let notEligibleString = "You need to be a Nitro Booster, Twitch/YouTube subscriber or moderator to manage a personal role.";
    // Check if user is eligible to use this command
    if (!isEligibleForPersonalRole) return sendMessage({ interaction: interaction, content: notEligibleString });
    // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
    // if (interaction.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;
    if (interaction.guild.members.me.roles.highest.position <= personalRolePosition) return sendMessage({ interaction: interaction, content: `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.` });
    if (deleteBool == true) return deleteRole({
        interaction: interaction,
        roleDB: roleDB,
        successString: "Deleted your personal role and database entry.",
        failString: "Your personal role isn't in my database so I can't delete it."
    });
    // Might want to change checks to be more inline with role tags (assuming a mod role tag will be added someday)
    // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
    if (!isEligibleForPersonalRole) return deleteRole({
        interaction: interaction,
        roleDB: roleDB,
        successString: "Since you can't manage a personal role anymore I cleaned up your old role.",
        failString: notEligibleString
    });

    if (roleDB) {
        let editReturnString = `Updated your role.`;
        let personalRole = interaction.guild.roles.cache.get(roleDB.role_id);
        if (!personalRole) return createRole();
        if (!colorArg && !colorGradientArg && !colorStyleArg) roleColors = personalRole.colors;
        if (JSON.stringify(roleColors) != JSON.stringify(personalRole.colors)) {
            editReturnString += `\n- Color set to `;
            if (colorStyleArg == "default") {
                editReturnString += `${inlineCode("Default")}.`;
            } else if (colorStyleArg == "holographic") {
                editReturnString += `${inlineCode("Holographic")}.`;
            } else {
                editReturnString += ` ${inlineCode(`#${numberToHex(roleColors.primaryColor)}`)}`;
                if (roleColors.secondaryColor) editReturnString += ` & ${inlineCode(`#${numberToHex(roleColors.secondaryColor)}`)}`;
                editReturnString += ".";
            };
        };
        try {
            await personalRole.edit({
                name: interaction.user.username,
                colors: roleColors,
                position: personalRolePosition,
                permissions: []
            });
        } catch (e: any) {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: `An error occurred.` });
        };

        if (iconArg && iconsAllowed && fileIsImg) {
            let roleIconSizeLimit = 256;
            if (iconSize > roleIconSizeLimit) {
                editReturnString += `\nFailed to update the image, make sure the image is under ${roleIconSizeLimit}kb. `;
            } else {
                try {
                    await personalRole.setIcon(iconImg, [`Personal role image update requested by ${interaction.user.username} (${interaction.user.id}).`]);
                    editReturnString += `\n- Image updated.`;
                } catch (e: any) {
                    // console.log(e);
                    editReturnString += `\n- Failed to update image.`;
                };
            };
        } else if (iconArg && !iconsAllowed) {
            editReturnString += `\n- ${guildNameFormatted} does not have role icons unlocked.`;
        };
        // Re-add role if it got removed
        if (!interaction.member.roles.cache.find(r => r.name == interaction.user.username)) interaction.member.roles.add(personalRole.id);

        return sendMessage({ interaction: interaction, content: editReturnString });
    } else {
        // Create role if it doesn't exit yet
        return createRole();
    };

    async function createRole() {
        // Clean up possible old entry
        let oldEntry = await serverApi.PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.user.id } });
        if (oldEntry) await oldEntry.destroy();
        if (!colorArg && !colorGradientArg && !colorStyleArg) roleColors = defaultColorStyle;
        // Create role
        try {
            await interaction.guild.roles.create({
                name: interaction.user.username,
                colors: roleColors,
                position: personalRolePosition,
                reason: `Personal role for ${interaction.user.username} (${interaction.user.id}).`,
                permissions: []
            });
        } catch (e: any) {
            // console.log(e);
            if (e.toString().includes("Missing Permissions")) {
                return logger({ exception: e, interaction: interaction });
            } else {
                return sendMessage({ interaction: interaction, content: `An error occurred creating a role.` });
            };
        };
        let createdRole = await interaction.guild.roles.cache.find(role => role.name == interaction.user.username);
        try {
            if (iconArg && iconsAllowed && fileIsImg) createdRole.setIcon(iconImg);
        } catch (e: any) {
            // console.log(e);
        };
        interaction.member.roles.add(createdRole.id);
        await serverApi.PersonalRoles.upsert({ server_id: interaction.guild.id, user_id: interaction.user.id, role_id: createdRole.id });
        return sendMessage({ interaction: interaction, content: `Created a personal role for you.` });
    };
};

async function deleteRole({ interaction, roleDB, successString, failString }) {
    if (roleDB) {
        await deletePersonalRole(roleDB, interaction.guild);
        return sendMessage({ interaction: interaction, content: successString });
    } else {
        return sendMessage({ interaction: interaction, content: failString });
    };
};

// String options
const colorOption = new SlashCommandStringOption()
    .setName("color")
    .setDescription("Specify a color in hexadecimal.")
    .setMinLength(6)
    .setMaxLength(6);
const colorGradientOption = new SlashCommandStringOption()
    .setName("color-gradient")
    .setDescription("Specify a color in hexadecimal for a gradient.")
    .setMinLength(6)
    .setMaxLength(6);
const colorStyleOption = new SlashCommandStringOption()
    .setName("color-style")
    .setDescription("Pick a role color style. Overrides other color options.")
    .addChoices([
        { name: "Holographic", value: "holographic" },
        { name: "Default", value: "default" }
    ]);
// Attachment options
const iconOption = new SlashCommandAttachmentOption()
    .setName("icon")
    .setDescription("Role icon to use. Requires sufficient boosts.");
// Subcommands
const editSubcommand = new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit or create your personal role.")
    .addStringOption(colorOption)
    .addStringOption(colorGradientOption)
    .addStringOption(colorStyleOption)
    .addAttachmentOption(iconOption);
const deleteSubcommand = new SlashCommandSubcommandBuilder()
    .setName("delete")
    .setDescription("Delete your personal role.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("personalrole")
    .setDescription("Update your personal role.")
    .setContexts([InteractionContextType.Guild])
    .addSubcommand(editSubcommand)
    .addSubcommand(deleteSubcommand);