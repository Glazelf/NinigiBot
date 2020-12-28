module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "personalrole",
    aliases: ["pr"]
};