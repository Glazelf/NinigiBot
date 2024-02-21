module.exports = (client, member) => {
    try {
        const Discord = require("discord.js");
        if (!member || !member.guild || !member.permissions) return false;
        if (member.guild.ownerID == member.id) {
            return true
        } else if (member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return true;
        } else {
            return false;
        };

    } catch (e) {
        // Log error
        const logger = require('./logger');

        logger(e, client);
    };
};