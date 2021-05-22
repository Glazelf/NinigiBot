module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });
        if (!serverID) return sendMessage(client, message, `Personal Roles are disabled in **${message.guild.name}**.`);
        let memberFetch = await message.guild.members.fetch();
        let memberCache = memberFetch.get(message.author.id);

        let roleDB = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.author.id } });

        // Get Nitro Booster position
        let boosterRole = await message.guild.roles.premiumSubscriberRole;

        let personalRolePosition = boosterRole.position + 1;
        // Custom role position for mods opens up a can of permission exploits where mods can mod eachother based on personal role order
        // if (message.member.roles.cache.has(modRole.id)) personalRolePosition = modRole.position + 1;

        if (message.guild.me.roles.highest.position <= personalRolePosition) return sendMessage(client, message, `My highest role isn't above your personal role or the Nitro Boost role so I can't edit your personal role.`);

        if (args.length < 1) return sendMessage(client, message, `Please provide a color to change your personal role to.`);

        // Color catch
        let roleColor = args[0];
        if (roleColor) {
            if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);
        };

        if (args[0] == "delete") return deleteRole(`Successfully deleted your personal role and database entry.`, `Your personal role isn't in my database so I can't delete it`);

        // Might want to change checks to be more inline with v13's role tags (assuming a mod role tag will be added)
        if (!boosterRole && !message.member.permissions.has("MANAGE_ROLES")) return deleteRole(`Since you can't manage a personal role anymore I cleaned up your old role.`, `You need to be a Nitro Booster or Mod to manage a personal role.`);

        if (roleDB) {
            let personalRole = message.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();

            if (!args[0]) roleColor = personalRole.color;

            personalRole.edit({
                name: message.author.tag,
                color: roleColor,
                position: personalRolePosition
            }).catch(e => {
                // console.log(e);
                return sendMessage(client, message, `An error occurred.`);
            });

            // Re-add role if it got removed
            if (!message.member.roles.cache.find(r => r.name == message.author.tag)) memberCache.roles.add(personalRole.id);

            return sendMessage(client, message, `Updated your role successfully.`);

        } else {
            // Create role if it doesn't exit yet
            return createRole();
        };

        async function createRole() {
            // Clean up possible old entry
            let oldEntry = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.author.id } });
            if (oldEntry) await oldEntry.destroy();

            if (!args[0]) roleColor = 0;

            // Create role
            await message.guild.roles.create({
                data: {
                    name: message.author.tag,
                    color: roleColor,
                    position: personalRolePosition
                },
                reason: `Personal role for ${message.author.tag}.`,
            }).catch(error => {
                // console.log(error);
                return sendMessage(client, message, `An error occurred.`);
            });

            let createdRole;
            await message.guild.roles.cache.forEach(role => {
                if (role.name == message.author.tag) createdRole = role;
            });
            memberCache.roles.add(createdRole.id);
            await PersonalRoles.upsert({ server_id: message.guild.id, user_id: message.author.id, role_id: createdRole.id });
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