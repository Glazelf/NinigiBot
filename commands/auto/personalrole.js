import {
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandAttachmentOption,
    bold
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/perms/isAdmin.js";
import deletePersonalRole from "../../util/deletePersonalRole.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import colorHexes from "../../objects/colorHexes.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let serverApi = await import("../../database/dbServices/server.api.js");
    serverApi = await serverApi.default();
    let adminBool = isAdmin(interaction.member);
    let modBool = interaction.member.permissions.has(PermissionFlagsBits.ManageRoles);
    let serverID = await serverApi.PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
    if (!serverID) return sendMessage({ interaction: interaction, content: `Personal Roles are disabled in ${bold(interaction.guild.name)}.` });

    let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.user.id } });

    ephemeral = true;
    await interaction.deferReply({ ephemeral: ephemeral });

    let colorArg = interaction.options.getString('color-hex');
    let iconArg = interaction.options.getAttachment("icon");

    let roleColor = null;
    let iconImg = null;
    let deleteBool = false;
    let fileIsImg = false;
    let iconSize = 0;
    if (colorArg) roleColor = colorArg;
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
    let nitroLevel2Req = 7;
    if (interaction.guild.premiumSubscriptionCount >= nitroLevel2Req || interaction.guild.verified || interaction.guild.partnered) iconsAllowed = true;
    // Get Nitro Booster position
    let boosterRole = await interaction.guild.roles.premiumSubscriberRole;
    if (!boosterRole) return sendMessage({ interaction: interaction, content: `${bold(interaction.guild)} does not have a Nitro Booster role. This role is created the first time someone boosts the server.` });
    let boosterBool = interaction.member.roles.cache.has(boosterRole.id);
    let personalRolePosition = boosterRole.position + 1;
    // Check SKU entitlement
    let botSubscriberBool = false;
    if (interaction.guild.id == globalVars.ShinxServerID) {
        let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });
        let ninigiSubscriptions = entitlements.find(entitlement => entitlement.skuId == "1164974692889808999" && entitlement.userId == interaction.user.id);
        if (ninigiSubscriptions && Object.entries(ninigiSubscriptions).length > 0) botSubscriberBool = true;
    };
    // Check if user is eligible to use this command
    if (!boosterBool && !modBool && !adminBool && !botSubscriberBool) return sendMessage({ interaction: interaction, content: `You need to be a Nitro Booster or moderator to manage a personal role.` });
    // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
    // if (interaction.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;
    if (interaction.guild.members.me.roles.highest.position <= personalRolePosition) return sendMessage({ interaction: interaction, content: `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.` });
    if (roleColor) {
        roleColor = roleColor.replace(/\W/g, ''); // Remove non-alphanumeric characters
        roleColor = roleColor.toLowerCase();
        if (colorHexes[roleColor]) roleColor = colorHexes[roleColor];
        if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
        while (roleColor.length < 6) roleColor = "0" + roleColor;
    };
    if (deleteBool == true) return deleteRole({
        client: interaction.client,
        interaction: interaction,
        roleDB: roleDB,
        successString: "Deleted your personal role and database entry.",
        failString: "Your personal role isn't in my database so I can't delete it."
    });
    // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
    // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
    if (!boosterRole && !modBool && !adminBool && !botSubscriberBool) return deleteRole({
        client: interaction.client,
        interaction: interaction,
        roleDB: roleDB,
        successString: "Since you can't manage a personal role anymore I cleaned up your old role.",
        failString: "You need to be a Nitro Booster or moderator to manage a personal role."
    });

    if (roleDB) {
        let editReturnString = `Updated your role.`;
        let personalRole = interaction.guild.roles.cache.find(r => r.id == roleDB.role_id);
        if (!personalRole) return createRole();
        if (!colorArg) roleColor = personalRole.color;
        if (roleColor != personalRole.color) editReturnString += `\n- Color set to \`#${roleColor}\`.`;

        personalRole.edit({
            name: interaction.user.username,
            color: roleColor,
            position: personalRolePosition,
            permissions: []
        }).catch(e => {
            // console.log(e);
            return sendMessage({ interaction: interaction, content: `An error occurred.` });
        });
        if (iconArg && iconsAllowed && fileIsImg) {
            let roleIconSizeLimit = 256;
            if (iconSize > roleIconSizeLimit) {
                editReturnString += `\nFailed to update the image, make sure the image is under ${roleIconSizeLimit}kb. `;
            } else {
                try {
                    await personalRole.setIcon(iconImg, [`Personal role image update requested by ${interaction.user.username} (${interaction.user.id}).`]);
                    editReturnString += `\n- Image updated.`;
                } catch (e) {
                    // console.log(e);
                    editReturnString += `\n- Failed to update image.`;
                };
            };
        } else if (iconArg && !iconsAllowed) {
            editReturnString += `-${bold(interaction.guild.name)} does not have role icons unlocked.`;
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
        if (!colorArg) roleColor = 0;
        // Create role
        try {
            await interaction.guild.roles.create({
                name: interaction.user.username,
                color: roleColor,
                position: personalRolePosition,
                reason: `Personal role for ${interaction.user.username} (${interaction.user.id}).`,
                permissions: []
            });
        } catch (e) {
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
        } catch (e) {
            // console.log(e);
        };
        interaction.member.roles.add(createdRole.id);
        await serverApi.PersonalRoles.upsert({ server_id: interaction.guild.id, user_id: interaction.user.id, role_id: createdRole.id });
        return sendMessage({ interaction: interaction, content: `Created a personal role for you.` });
    };
};

async function deleteRole({ client, interaction, roleDB, successString, failString }) {
    if (roleDB) {
        await deletePersonalRole(roleDB, interaction.guild);
        return sendMessage({ interaction: interaction, content: successString });
    } else {
        return sendMessage({ interaction: interaction, content: failString });
    };
};

// String options
const colorHexOption = new SlashCommandStringOption()
    .setName("color-hex")
    .setDescription("Specify a color.");
// Attachment options
const iconOption = new SlashCommandAttachmentOption()
    .setName("icon")
    .setDescription("Role icon to use. Requires sufficient boosts.");
// Subcommands
const editSubcommand = new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit or create your personal role.")
    .addStringOption(colorHexOption)
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