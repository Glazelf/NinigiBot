exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });
        if (!serverID) return sendMessage(client, message, `Personal Roles are disabled in **${message.guild.name}**.`);

        let roleDB = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.member.id } });

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
            if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
            while (roleColor.length < 6) roleColor = "0" + roleColor;
        };

        if (args[0] == "delete") return deleteRole(`Successfully deleted your personal role and database entry.`, `Your personal role isn't in my database so I can't delete it.`);

        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;
        };

        // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
        // Needs to be bugfixed, doesn't check booster role properly anymore and would allow anyone to use command
        if (!boosterRole && !message.member.permissions.has("MANAGE_ROLES") && !adminBool) return deleteRole(`Since you can't manage a personal role anymore I cleaned up your old role.`, `You need to be a Nitro Booster or moderator to manage a personal role.`);

        if (roleDB) {
            let personalRole = message.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();

            if (!args[0]) roleColor = personalRole.color;

            personalRole.edit({
                name: user.tag,
                color: roleColor,
                position: personalRolePosition
            }).catch(e => {
                // console.log(e);
                return sendMessage(client, message, `An error occurred.`);
            });

            // Re-add role if it got removed
            if (!message.member.roles.cache.find(r => r.name == user.tag)) message.member.roles.add(personalRole.id);

            return sendMessage(client, message, `Updated your role successfully. Color set to \`#${roleColor}\`.`);

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
                })
            } catch (e) {
                // console.log(error);
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    return sendMessage(client, message, `An error occurred creating a role.`);
                };
            };

            let createdRole = await message.guild.roles.cache.find(role => role.name == user.tag);

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
        // log error
        const logger = require('../../util/logger');

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