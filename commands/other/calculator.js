import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";

export default async (client, interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        await interaction.deferReply({ ephemeral: ephemeral });

        let maxMessageLength = 2000;
        let noInputString = `You need to provide a valid input.`;
        let input = interaction.options.getString("input");
        // Sanitize input
        let sanitizeValues = [
            " ",
            "`",
            '"',
            "'",
            "{",
            "}",
            "[",
            "]",
            "<",
            ">",
            "&",
            "$"
        ];
        let calcInput = input.replace("x", "*").replace(",", ".").replace(/[a-zA-Z]/gm, '');
        if (!calcInput.includes("!=")) calcInput = calcInput.replace("=", "==");
        sanitizeValues.forEach(function (value) {
            calcInput = calcInput.replace(value, "");
        });
        if (!calcInput) return sendMessage({ client: client, interaction: interaction, content: noInputString });
        let evaled = null;
        try {
            evaled = eval(calcInput);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, interaction: interaction, content: noInputString });
        };
        // Test out rounding based on remainder sometime
        // let remainder = evaled % 1;
        // Amount of 0's is the amount of decimals to round to
        let rounded = Math.round((evaled + Number.EPSILON) * 10000) / 10000;
        let output = Discord.codeBlock("js", `${rounded} (${calcInput})`);
        if (calcInput.includes("^")) output += `Note: Exponentials (^) are currently [not supported](<https://github.com/Glazelf/NinigiBot/issues/436>).`;
        let returnString = output;
        if (output.length > maxMessageLength) returnString = Discord.codeBlock("js", rounded.toString());

        return sendMessage({ client: client, interaction: interaction, content: returnString });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "calculator",
    description: "Calculate.",
    options: [{
        name: "input",
        type: Discord.ApplicationCommandOptionType.String,
        description: "Input to calculate.",
        required: true
    }, {
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the response should be ephemeral."
    }]
};