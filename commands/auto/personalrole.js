exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });
        if (!serverID) return sendMessage(client, message, `Personal Roles are disabled in **${message.guild.name}**.`);

        let roleDB = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.member.id } });

        // Check if icons are possible
        let iconsAllowed = false;
        let nitroLevel2Req = 7;
        if (message.guild.premiumSubscriptionCount > nitroLevel2Req || message.guild.verified || message.guild.partnered) iconsAllowed = true;

        // Get Nitro Booster position
        let boosterRole = await message.guild.roles.premiumSubscriberRole;
        if (!boosterRole) return sendMessage(client, message, `**${message.guild}** does not have a Nitro Boost role. This role is created the first time someone boosts a server.`);
        let personalRolePosition = boosterRole.position + 1;

        if (!message.member.roles.cache.has(boosterRole.id) && !message.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage(client, message, `You need to be a Nitro Booster or moderator to manage a personal role.`);

        // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
        // if (message.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;

        if (message.guild.me.roles.highest.position <= personalRolePosition) return sendMessage(client, message, `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.`);

        // Color catch
        let roleColor = args[0];
        if (roleColor) {
            roleColor = roleColor.replace(/\W/g, ''); // Remove non-alphanumeric characters
            roleColor = roleColor.toLowerCase();

            // Default colors
            let greyHex = "36393f";
            switch (roleColor) {
                case "red":
                    roleColor = "ff2121";
                    break;
                case "orange":
                    roleColor = "ff6426";
                    break;
                case "yellow":
                    roleColor = "ffc338";
                    break;
                case "green":
                    roleColor = "7dff45";
                    break;
                case "turqouise":
                    roleColor = "45ffb5";
                    break;
                case "blue":
                    roleColor = "084dff";
                    break;
                case "purple":
                    roleColor = "842bff";
                    break;
                case "pink":
                    roleColor = "f6a6ff";
                    break;
                case "burgundy":
                    roleColor = "a62460";
                    break;
                case "black":
                    roleColor = "000001"; // 000000 becomes transparent
                    break;
                case "white":
                    roleColor = "ffffff";
                    break;
                case "grey":
                    roleColor = greyHex;
                    break;
                case "gray":
                    roleColor = greyHex;
                    break;
                default:
                    break;
            };

            if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
            while (roleColor.length < 6) roleColor = "0" + roleColor;
        };

        if (args[0] == "delete") return deleteRole(`Successfully deleted your personal role and database entry.`, `Your personal role isn't in my database so I can't delete it.`);

        let messageImage = null;
        if (message.attachments.size > 0) messageImage = message.attachments.first().url;

        let user = message.member.user;

        // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
        // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
        if (!boosterRole && !message.member.permissions.has("MANAGE_ROLES") && !adminBool) return deleteRole(`Since you can't manage a personal role anymore I cleaned up your old role.`, `You need to be a Nitro Booster or moderator to manage a personal role.`);

        if (roleDB) {
            let editReturnString = `Updated your role successfully; `;
            let personalRole = message.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();

            if (!args[0]) roleColor = personalRole.color;

            if (roleColor != personalRole.color) editReturnString += `Color set to \`#${roleColor}\`. `;

            personalRole.edit({
                name: user.tag,
                color: roleColor,
                position: personalRolePosition
            }).catch(e => {
                // console.log(e);
                return sendMessage(client, message, `An error occurred.`);
            });

            if (messageImage && iconsAllowed) {
                try {
                    await personalRole.setIcon(messageImage);
                    editReturnString += `Image updated. `;
                } catch (e) {
                    // console.log(e);
                    let roleIconSizeLimit = `256kb`;
                    editReturnString += `Failed to update the image, make sure the image is under ${roleIconSizeLimit}. `;
                };
            } else if (messageImage && !iconsAllowed) {
                editReturnString += `Failed to update the image, **${message.guild.name}** does not have role icons unlocked. `;
            };

            // Re-add role if it got removed
            if (!message.member.roles.cache.find(r => r.name == user.tag)) message.member.roles.add(personalRole.id);

            return sendMessage(client, message, editReturnString);

        } else {
            // Create role if it doesn't exit yet
            return createRole();
        };

        async function createRole() {
            // Clean up possible old entry
            let oldEntry = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.member.id } });
            if (oldEntry) await oldEntry.destroy();

            if (!args[0]) roleColor = 0;

            // Create role
            try {
                await message.guild.roles.create({
                    name: user.tag,
                    color: roleColor,
                    position: personalRolePosition,
                    reason: `Personal role for ${user.tag}.`,
                });
            } catch (e) {
                // console.log(error);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    return sendMessage(client, message, `An error occurred creating a role.`);
                };
            };

            let createdRole = await message.guild.roles.cache.find(role => role.name == user.tag);
            try {
                if (messageImage && iconsAllowed) createdRole.setIcon(messageImage);
            } catch (e) {
                // console.log(e);
            };

            message.member.roles.add(createdRole.id);
            await PersonalRoles.upsert({ server_id: message.guild.id, user_id: message.member.id, role_id: createdRole.id });

            return sendMessage(client, message, `Created a personal role for you successfully.`);
        };

        async function deleteRole(successString, failString) {
            if (roleDB) {
                let oldRole = message.guild.roles.cache.find(r => r.id == roleDB.role_id);
                if (oldRole) await oldRole.delete();
                await roleDB.destroy();
                return sendMessage(client, message, successString);
            } else {
                return sendMessage(client, message, failString);
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "personalrole",
    aliases: ["pr"],
    description: "Updates your personal role color.",
    options: [{
        name: "color-hex",
        type: "STRING",
        description: "Specify the color you want. Type \"delete\" to delete your role."
    }]
};