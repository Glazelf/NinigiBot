const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let lowNumber = interaction.options.getInteger("number-min");
        let highNumber = interaction.options.getInteger("number-max");
        if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
        let randomValue = randomNumber(lowNumber, highNumber);

        return sendMessage({ client: client, interaction: interaction, content: `Your random number between \`${lowNumber}\` and \`${highNumber}\` is \`${randomValue}\`.`, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "rng",
    description: "Generate a random number.",
    options: [{
        name: "number-min",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Minimal number.",
        required: true
    }, {
        name: "number-max",
        type: Discord.ApplicationCommandOptionType.Integer,
        description: "Maximum number.",
        required: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether or not to send the owoified text as an ephemeral message.",
    }]
};