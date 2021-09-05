module.exports = async (client, info) => {
    try {
        // log error
        console.log(info);

        // Reboot bot
        let botjs = require('../bot.js');
        botjs();

    } catch (e) {
        const logger = require('../util/logger');

        logger(e, client);
    };
};