module.exports = async (client) => {
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        // Set bot status
        client.user.setPresence({ activities: [{ name: 'in Sinnoh' }], status: 'idle' });

        let timestamp = await getTime();

        // Console log status
        return console.log(`Resumed. (${timestamp})`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

