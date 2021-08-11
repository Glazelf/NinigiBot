module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        // Interaction only
        if (message.type == 'DEFAULT') return;

        try {
            await message.react('⭐');
        } catch (e) {
            // console.log(e);
        };

        return sendMessage(client, message, `Starred this message for you!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Ninigi Star",
    type: "MESSAGE"
};