module.exports = async (member, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (member.guild.ownerID !== member.id) {
            return true
        } else if (member.permissions.has("ADMINISTRATOR")) {
            return true;
        } else {
            return false;
        };

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};