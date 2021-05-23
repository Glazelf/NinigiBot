module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        // Minutes the user is muted
        let muteTime = 60;
        let muteRoleName = "muted";

        if (!args[0]) return message.channel.send(`> Please provide a mentioned user as an argument, ${message.author}.`);

        if (args[1]) {
            muteTime = args[1];
            if (isNaN(muteTime) || 1 > muteTime) return message.channel.send(`> Please provide a valid number, ${message.author}.`);
            if (muteTime > 10080) muteTime = 10080;
        };

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