module.exports = async (member, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");

        if (member.guild.ownerID !== member.id) return true;
        if (member.hasPermission("ADMINISTRATOR")) return true;
        return false;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};