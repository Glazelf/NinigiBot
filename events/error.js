module.exports = (client, info) => {
    // log error
    console.log(info);

    const logger = require('../util/logger');

    logger(e, client);
};