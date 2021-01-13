module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_ROLES") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_ROLES")) return message.channel.send(`> To mute people I need permission to manage roles, ${message.author}.`);

        // Minutes the user is muted
        let muteTime = 60;
        let split = message.content.split(` `, 3);
        let muteRoleName = "muted";

        if (split[2]) {
            muteTime = split[2];
            if (isNaN(muteTime) || 1 > muteTime) return message.channel.send(`> Please provide a valid number, ${message.author}.`);
        };

        if (args[0]) {
            const member = message.mentions.members.first();
            if (!member) return message.channel.send(`> Please use a proper mention if you want to mute someone, ${message.author}.`);
            const role = member.guild.roles.cache.find(role => role.name.toLowerCase() == muteRoleName);
            if (!role) return message.channel.send(`> There is no mute role. In order to mute someone, you need to create a role called "Muted", ${message.author}.`);

            let isMuted = member.roles.cache.find(r => r.name.toLowerCase() == muteRoleName);
            if (isMuted) {
                await member.roles.remove(role);
                return message.channel.send(`> ${member.user.tag} has been unmuted, ${message.author}.`);
            } else {
                await member.roles.add(role);
                message.channel.send(`> ${member.user.tag} has been muted for ${muteTime} minute(s), ${message.author}.`);
                // sets a timeout to unmute the user.
                setTimeout(async () => { await member.roles.remove(role) }, muteTime * 60 * 1000);
            };
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "mute",
    aliases: ["unmute"]
};