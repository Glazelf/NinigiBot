module.exports = async (client, info) => {
    const logger = require('../util/logger');
    try {
        logger(info, client);
    } catch (e) {
        // Log error
        logger(e, client);
    };
};