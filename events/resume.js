module.exports = async (client) => {
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        // Set bot status
        client.user.setPresence(client.globalVars.presence);

        let timestamp = await getTime(client);

        // Console log status
        // console.log(`Resumed. (${timestamp})`);
        return;

    } catch (e) {
        // Log error
        console.log(e);
    };
};