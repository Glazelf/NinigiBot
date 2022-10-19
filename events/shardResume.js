module.exports = async (client, id) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        // Set bot status
        client.user.setPresence(globalVars.presence);

        let timestamp = await getTime();

        // Console log status
        // console.log(`Reconnected shard ${id}. (${timestamp})`);
        return;

    } catch (e) {
        // Log error
        console.log(e);
    };
};