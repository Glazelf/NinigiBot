module.exports = async (client) => {
    try {
        let currentdate = new Date();
        let datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds() + " UTC";
        return datetime;

    } catch (e) {
        // Log error
        const logger = require('./logger');

        logger(e, client);
    };
};