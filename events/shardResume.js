module.exports = async (client, id) => {
    try {
        const Discord = require("discord.js");

        // Set bot status
        client.user.setPresence({ activity: { name: 'in Sinnoh' }, status: 'idle' });

        // Console log status
        return console.log(`Successfully reconnected shard ${id}!`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

