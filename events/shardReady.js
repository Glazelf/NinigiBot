module.exports = async (client, id) => {
    try {
        const Discord = require("discord.js");
        const getTime = require('../util/getTime');

        let timestamp = await getTime();

        client.user.setPresence({ activities: [{ name: 'in Sinnoh' }], status: 'idle' });

        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

