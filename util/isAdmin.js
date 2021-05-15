module.exports = async (member, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (member.guild.ownerID !== member.id) return true;
        if (member.permissions.has("ADMINISTRATOR")) return true;
        return false;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};