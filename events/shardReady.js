module.exports = async (client, id) => {
    try {
        const Discord = require("discord.js");

        // Console log status
        return console.log(`Finished launching shard ${id}`);

    } catch (e) {
        // log error
        console.log(e);
    };
};

