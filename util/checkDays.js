module.exports = async (date, client) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000);
        return days + (days == 1 ? " day" : " days") + " ago";

    } catch (e) {
        // Log error
        const logger = require('./logger');

        logger(e, client);
    };
};