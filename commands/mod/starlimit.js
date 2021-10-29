exports.run = async (client, message, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);

        const { StarboardLimits } = require('../../database/dbObjects');
        let oldStarLimitDB = await StarboardLimits.findOne({ where: { server_id: message.guild.id } });
        let oldStarLimit
        if (oldStarLimitDB) {
            oldStarLimit = oldStarLimitDB.star_limit;
        } else {
            oldStarLimit = globalVars.starboardLimit;
        };

        // Database and input stuff
        if (args[0] && (adminBool || message.member.permissions.has("MANAGE_CHANNELS"))) {
            let starLimit = args[0];
            if (isNaN(starLimit)) return sendMessage(client, message, `You need to provide a valid number.`);

            if (oldStarLimitDB) oldStarLimitDB.destroy();
            await StarboardLimits.upsert({ server_id: message.guild.id, star_limit: starLimit });

            return sendMessage(client, message, `The star limit was changed to ${starLimit}.`);

            // If no input or user lacks permissions: Show current star limit
        } else {
            return sendMessage(client, message, `The current star limit is ${oldStarLimit}.`);
        };

    } catch (e) {
        // Log error
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