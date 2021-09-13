module.exports = async (client, info) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        // Log error
        console.log(info);

        // Reboot bot
        let botjs = require('../bot.js');
        botjs();

    } catch (e) {
        // Log error
        logger(e, client);
    };
};