module.exports = async (client, info) => {
    const logger = require('../../util/logger');
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