module.exports = async (client, id) => {
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');
        // Set bot status
        client.user.setPresence(client.globalVars.presence);

        let timestamp = await getTime();
        // Console log status
        // console.log(`Reconnected shard ${id}. (${timestamp})`);
        return;

    } catch (e) {
        // Log error
        console.log(e);
    };
};