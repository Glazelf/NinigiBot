module.exports = async (client, oldMember, newMember) => {
    const logger = require('../util/logger');
    try {
        // Was used for vc text channel functionality, is now unused
        return;

    } catch (e) {
        // Log error
        logger(e, client);
    };
};