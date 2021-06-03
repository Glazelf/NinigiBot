module.exports = (client, info) => {
    try {
        // log error
        console.log(info);

        // Reboot bot
        let botjs = require('../bot');
        botjs.botjs();

    } catch (e) {
        const logger = require('../util/logger');

        logger(e, client);
    };
};