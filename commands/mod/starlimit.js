exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);

        const { StarboardLimits } = require('../../database/dbObjects');
        let oldStarLimitDB = await StarboardLimits.findOne({ where: { server_id: message.guild.id } });
        let oldStarLimit
        if (oldStarLimitDB) {
            oldStarLimit = oldStarLimitDB.star_limit;
        } else {
            oldStarLimit = globalVars.starboardLimit;
        };

        if (args[0] && (adminBool || message.member.permissions.has("MANAGE_CHANNELS"))) {
            let starLimit = args[0];
            if (isNaN(starLimit)) return sendMessage(client, message, `You need to provide a valid number.`);

            if (oldStarLimitDB) oldStarLimitDB.destroy();
            await StarboardLimits.upsert({ server_id: message.guild.id, star_limit: starLimit });

            return sendMessage(client, message, `The star limit was changed to ${starLimit}.`);
        } else {
            return sendMessage(client, message, `The current star limit is ${oldStarLimit}.`);
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starlimit",
    aliases: ["sl"],
    description: "Change the star amount to appear on starboard.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "Amount of stars required."
    }]
};