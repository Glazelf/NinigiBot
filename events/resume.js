module.exports = async (client) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        // Set bot status
        client.user.setPresence(globalVars.presence);

        let timestamp = await getTime(client);

        // Console log status
        return console.log(`Resumed. (${timestamp})`);

    } catch (e) {
        // Log error
        console.log(e);
    };
};

