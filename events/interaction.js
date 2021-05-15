module.exports = async (client, interaction) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        console.log(interaction);

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client);
    };
};