exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_ROLES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        // Minutes the user is muted
        let muteTime = 60;
        let muteRoleName = "muted";

        // Get user
        if (!args[0]) return sendMessage(client, message, `Please provide a mentioned user as an argument.`);

        if (args[1]) {
            muteTime = args[1];
            if (isNaN(muteTime) || 1 > muteTime) return sendMessage(client, message, `Please provide a valid number.`);
            if (muteTime > 10080) muteTime = 10080;
        };

        let member;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            member = message.mentions.members.first();
        };
        if (!member) {
            let memberID = args[0];
            member = await message.guild.members.fetch(memberID);
            if (!member) member = message.guild.members.cache.find(member => member.user.username.toLowerCase() == args[0].toString().toLowerCase());
        };
        if (!member) return sendMessage(client, message, `Please use a proper mention if you want to mute someone.`);
        const role = member.guild.roles.cache.find(role => role.name.toLowerCase() == muteRoleName);
        if (!role) return sendMessage(client, message, `There is no mute role. In order to mute someone, you need to create a role called "Muted".`);

        // Check permissions
        let userRole = message.member.roles.highest;
        let targetRole = member.roles.highest;
        if (targetRole.position >= userRole.position && message.guild.ownerId !== message.member.id) return sendMessage(client, message, `You don't have a high enough role to mute **${member.user.tag}** (${member.id}).`);

        // If already muted, unmute. If not, mute.
        let isMuted = member.roles.cache.find(r => r.name.toLowerCase() == muteRoleName);
        if (isMuted) {
            await member.roles.remove(role);
            return sendMessage(client, message, `Unmuted **${member.user.tag}** (${member.id}).`);
        } else {
            await member.roles.add(role);
            sendMessage(client, message, `Muted **${member.user.tag}** (${member.id}) for ${muteTime} minute(s).`);
            // sets a timeout to unmute the user.
            setTimeout(async () => { await member.roles.remove(role) }, muteTime * 60 * 1000);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Mute",
    type: "USER"
};