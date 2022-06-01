module.exports = async (client, oldMember, newMember) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        // Was used for vc text channel functionality, is now unused
        return;

    } catch (e) {
        // Log error
        logger(e, client);
    };
};