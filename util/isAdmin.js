module.exports = async (client, member) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (!member || !member.guild || !member.permissions) return false;
        if (member.guild.ownerID == member.id) {
            return true
        } else if (member.permissions.has("ADMINISTRATOR")) {
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