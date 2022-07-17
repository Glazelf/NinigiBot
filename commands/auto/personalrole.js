const Discord = require("discord.js");
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        const colorHexes = require('../../objects/colorHexes.json');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = isAdmin(client, interaction.member);
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: interaction.guild.id } });
        if (!serverID) return sendMessage({ client: client, interaction: interaction, content: `Personal Roles are disabled in **${interaction.guild.name}**.` });

        let roleDB = await PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.user.id } });

        let ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let colorArg = interaction.options.getString('color-hex');
        let iconArg = interaction.options.getAttachment("icon");
        let deleteArg = interaction.options.getBoolean("delete");

        let roleColor = null;
        let iconImg = null;
        let iconSize = 0;
        let deleteBool = false;
        let fileIsImg = false;

        if (colorArg) roleColor = colorArg;
        if (iconArg) {
            // Object seems to be structured differently between ephemeral and public messages, or I may be stupid
            iconImg = iconArg.attachment.url;
            if (!iconImg) iconImg = iconArg.attachment;
            iconSize = Math.ceil(iconArg.attachment.size / 1000);
            if (iconArg.contentType.includes('image')) fileIsImg = true;
        };
        if (deleteArg === true) deleteBool = deleteArg;

        // Check if icons are possible
        let iconsAllowed = false;
        let nitroLevel2Req = 7;
        if (interaction.guild.premiumSubscriptionCount >= nitroLevel2Req || interaction.guild.verified || interaction.guild.partnered) iconsAllowed = true;

        // Get Nitro Booster position
        let boosterRole = await interaction.guild.roles.premiumSubscriberRole;
        if (!boosterRole) return sendMessage({ client: client, interaction: interaction, content: `**${interaction.guild}** does not have a Nitro Boost role. This role is created the first time someone boosts a server.` });
        let personalRolePosition = boosterRole.position + 1;
        if (!interaction.member.roles.cache.has(boosterRole.id) && !interaction.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: `You need to be a Nitro Booster or moderator to manage a personal role.` });
        // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
        // if (interaction.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;
        if (interaction.guild.me.roles.highest.position <= personalRolePosition) return sendMessage({ client: client, interaction: interaction, content: `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.` });

        if (roleColor) {
            roleColor = roleColor.replace(/\W/g, ''); // Remove non-alphanumeric characters
            roleColor = roleColor.toLowerCase();
            if (colorHexes[roleColor]) roleColor = colorHexes[roleColor];
            if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
            while (roleColor.length < 6) roleColor = "0" + roleColor;
        };

        if (deleteBool == true) return deleteRole(`Deleted your personal role and database entry.`, `Your personal role isn't in my database so I can't delete it.`);

        // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
        // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
        if (!boosterRole && !interaction.member.permissions.has("MANAGE_ROLES") && !adminBool) return deleteRole(`Since you can't manage a personal role anymore I cleaned up your old role.`, `You need to be a Nitro Booster or moderator to manage a personal role.`);

        if (roleDB) {
            let editReturnString = `Updated your role.`;
            let personalRole = interaction.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();
            if (!colorArg) roleColor = personalRole.color;
            if (roleColor != personalRole.color) editReturnString += `\n-Color set to \`#${roleColor}\`.`;

            personalRole.edit({
                name: interaction.user.tag,
                color: roleColor,
                position: personalRolePosition
            }).catch(e => {
                // console.log(e);
                return sendMessage({ client: client, interaction: interaction, content: `An error occurred.` });
            });

            if (iconArg && iconsAllowed && fileIsImg) {
                let roleIconSizeLimit = 256;
                if (iconSize > roleIconSizeLimit) {
                    editReturnString += `\nFailed to update the image, make sure the image is under ${roleIconSizeLimit}kb. `;
                } else {
                    try {
                        await personalRole.setIcon(iconImg, [`Personal role image update requested by ${interaction.user.tag}.`]);
                        editReturnString += `\n-Image updated.`;
                    } catch (e) {
                        // console.log(e);
                        editReturnString += `\n-Failed to update image.`;
                    };
                };
            } else if (iconArg && !iconsAllowed) {
                editReturnString += `-**${interaction.guild.name}** does not have role icons unlocked.`;
            };
            // Re-add role if it got removed
            if (!interaction.member.roles.cache.find(r => r.name == interaction.user.tag)) interaction.member.roles.add(personalRole.id);

            return sendMessage({ client: client, interaction: interaction, content: editReturnString });

        } else {
            // Create role if it doesn't exit yet
            return createRole();
        };

        async function createRole() {
            // Clean up possible old entry
            let oldEntry = await PersonalRoles.findOne({ where: { server_id: interaction.guild.id, user_id: interaction.user.id } });
            if (oldEntry) await oldEntry.destroy();

            if (!colorArg) roleColor = 0;

            // Create role
            try {
                await interaction.guild.roles.create({
                    name: interaction.user.tag,
                    color: roleColor,
                    position: personalRolePosition,
                    reason: `Personal role for ${interaction.user.tag}.`,
                });
            } catch (e) {
                // console.log(e);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    return sendMessage({ client: client, interaction: interaction, content: `An error occurred creating a role.` });
                };
            };

            let createdRole = await interaction.guild.roles.cache.find(role => role.name == interaction.user.tag);
            try {
                if (iconArg && iconsAllowed && fileIsImg) createdRole.setIcon(iconImg);
            } catch (e) {
                // console.log(e);
            };
            interaction.member.roles.add(createdRole.id);
            await PersonalRoles.upsert({ server_id: interaction.guild.id, user_id: interaction.user.id, role_id: createdRole.id });
            return sendMessage({ client: client, interaction: interaction, content: `Created a personal role for you.` });
        };

        async function deleteRole(successString, failString) {
            if (roleDB) {
                let oldRole = interaction.guild.roles.cache.find(r => r.id == roleDB.role_id);
                if (oldRole) await oldRole.delete();
                await roleDB.destroy();
                return sendMessage({ client: client, interaction: interaction, content: successString });
            } else {
                return sendMessage({ client: client, interaction: interaction, content: failString });
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "personalrole",
    description: "Update your personal role.",
    options: [{
        name: "color-hex",
        type: "STRING",
        description: "Specify a color."
    }, {
        name: "icon",
        type: "ATTACHMENT",
        description: "Role icon to use. Requires sufficient boosts."
    }, {
        name: "delete",
        type: "BOOLEAN",
        description: "Delete your personal role."
    }]
};