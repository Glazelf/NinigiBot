import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import leadingZeros from "../../util/leadingZeros.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;

    let input = null;
    switch (interaction.options.getSubcommand()) {
        case "tohex":
            input = interaction.options.getInteger("input");
            let hexString = input.toString(16).toUpperCase();
            hexString = leadingZeros(hexString, 6);
            let returnString = codeBlock("js", `0x${hexString}`)
            return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral });
        case "todecimal":
            try {
                input = interaction.options.getString("input");
                while (input.length < 6) input = "0" + input;
                let argHex = `0x${input}`;
                let hexInt = parseInt(argHex);
                let returnString = codeBlock("js", hexInt.toString())
                return sendMessage({ interaction: interaction, content: returnString, ephemeral: ephemeral });
            } catch (e) {
                return sendMessage({ interaction: interaction, content: "An error occurred trying to convert to decimal. Make sure your input is a valid hex." });
            };
    };
};

// String options
const inputHexOption = new SlashCommandStringOption()
    .setName("input")
    .setDescription("Hexadecimal to convert to decimal.")
    .setRequired(true);
// Integer options
const inputDecimalOption = new SlashCommandIntegerOption()
    .setName("input")
    .setDescription("Number to convert to hex.")
    .setMinValue(0)
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const toHexSubcommand = new SlashCommandSubcommandBuilder()
    .setName("tohex")
    .setDescription("Convert a number to hexadecimal.")
    .addIntegerOption(inputDecimalOption)
    .addBooleanOption(ephemeralOption);
const toDecimalSubcommand = new SlashCommandSubcommandBuilder()
    .setName("todecimal")
    .setDescription("Convert from hexadecimal to decimal.")
    .addStringOption(inputHexOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("hexadecimal")
    .setDescription("Convert between decimal and hexadecimal.")
    .addSubcommand(toHexSubcommand)
    .addSubcommand(toDecimalSubcommand);