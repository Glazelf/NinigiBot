module.exports = async (reaction, client, message) => {
    try {
        // let guild = client.guilds.cache.get(message.guild.id);

        // if (reaction.emoji.name === "⭐") {
        //     console.log("someone removed a ⭐⭐⭐⭐⭐")
        // };

        return;

    } catch (e) {
        // log error
        let { logger } = require('./ready');
        logger(e);
    };
};
