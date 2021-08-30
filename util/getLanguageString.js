module.exports = async (language, stringName) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        return;

    } catch (e) {
        // log error
        const logger = require('./logger');

        logger(e, client);
    };
};