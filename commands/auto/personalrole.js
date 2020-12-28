const { forEach } = require('lodash');

module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_ROLES")) return message.channel.send(`> I don't have permission to manage roles, ${message.author}.`);
        const { PersonalRoles, PersonalRoleServers } = require('../../database/dbObjects');
        let serverID = await PersonalRoleServers.findOne({ where: { server_id: message.guild.id } });
        if (!serverID) return message.channel.send(`> Personal Roles are disabled in ${message.guild.name}, ${message.author}.`);
        let memberFetch = await message.guild.members.fetch();
        let memberCache = memberFetch.get(message.author.id);

        if (memberCache.premiumSince == 0) return message.channel.send(`> You need to be a Nitro Booster to manage a personal role, ${message.author}.`);

        let roleDB = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.author.id } });

        let subCommand = args[0].toLowerCase();
        // Color catch
        let roleColor = subCommand;
        if (!subCommand) roleColor = 0;
        if (roleColor.length > 6) roleColor = roleColor.substring(roleColor.length - 6, roleColor.length);

        if (roleDB) {
            let personalRole = message.guild.roles.cache.find(r => r.id == roleDB.role_id);
            if (!personalRole) return createRole();
            // Possibly add a function to delete your role later
            // if (subCommand == "delete") return deleteRole();

            personalRole.edit({
                name: message.author.tag,
                color: roleColor
            }).catch(error => {
                console.log(error);
                return message.channel.send(`> An error occurred, ${message.author}.`);
            });

            // Re-add role if it got removed
            if (!message.member.roles.find(r => r.name == message.author.tag)) memberCache.roles.add(createdRole.id);

            console.log(personalRole);
            console.log(roleColor);
            return message.channel.send(`> Updated your role successfully, ${message.author}.`);

        } else {
            // Create role if it doesn't exit yet
            return createRole();
        };

        async function createRole() {
            // Clean up possible old entry
            let oldEntry = await PersonalRoles.findOne({ where: { server_id: message.guild.id, user_id: message.author.id } });
            if (oldEntry) await oldEntry.destroy();

            // Create role
            await message.guild.roles.create({
                data: {
                    name: message.author.tag,
                    color: roleColor,
                },
                reason: `Personal role for ${message.author.tag}.`,
            }).catch(error => {
                console.log(error);
                return message.channel.send(`> An error occurred, ${message.author}.`);
            });

            let createdRole;
            await message.guild.roles.cache.forEach(role => {
                if (role.name == message.author.tag) createdRole = role;
            });
            memberCache.roles.add(createdRole.id);
            await PersonalRoles.upsert({ server_id: message.guild.id, user_id: message.author.id, role_id: createdRole.id });
            return message.channel.send(`> You didn't have a personal role so I created one for you, ${message.author}.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "personalrole",
    aliases: ["pr"]
};