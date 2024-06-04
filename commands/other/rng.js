import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import randomNumber from "../../util/randomNumber.js";

export default async (client, interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let lowNumber = interaction.options.getInteger("number-min");
        let highNumber = interaction.options.getInteger("number-max");
        if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
        let randomValue = randomNumber(lowNumber, highNumber);

        return sendMessage({ client: client, interaction: interaction, content: `Your random number between \`${lowNumber}\` and \`${highNumber}\` is \`${randomValue}\`.`, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
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