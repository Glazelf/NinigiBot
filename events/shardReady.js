module.exports = async (client, id) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        let timestamp = await client);

        client.user.setPresence(globalVars.presence);

        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

