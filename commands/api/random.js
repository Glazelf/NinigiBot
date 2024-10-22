import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import axios from "axios";
import {
    uniqueNamesGenerator,
    names
} from 'unique-names-generator'; // Random name generator that can be seeded
import sendMessage from "../../util/sendMessage.js";
import randomNumber from "../../util/math/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const catAPI = "https://cataas.com/cat";
const foxAPI = "https://randomfox.ca/floof/";

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;

    let randomEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor);
    switch (interaction.options.getSubcommand()) {
        case "number":
            let lowNumber = interaction.options.getInteger("number-min");
            let highNumber = interaction.options.getInteger("number-max");
            if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
            let randomValue = randomNumber(lowNumber, highNumber);
            randomEmbed
                .setTitle(randomValue.toString())
                .setFooter({ text: `Min: ${lowNumber}\nMax: ${highNumber}` });
            break;
        case "cat":
            await interaction.deferReply({ ephemeral: ephemeral });
            let catText = interaction.options.getString("caption");
            let standardCatText = "Meow";
            if (!catText) catText = standardCatText;

            let catResponse = await axios.get(`${catAPI}?json=true`);
            let catImage = null;
            let catNameSeed = null;
            catImage = `${catAPI}/${catResponse.data._id}`;
            if (catText !== standardCatText) catImage += `/says/${encodeURIComponent(encodeURIComponent(catText).replace(/%20/g, " "))}`; // Double encode to escape periods and slashes. Replace first encode's spaces to show those correctly
            catNameSeed = catResponse.data._id;
            let catName = uniqueNamesGenerator({
                dictionaries: [names],
                seed: catNameSeed
            });
            randomEmbed
                .setImage(catImage)
                .setFooter({ text: `"${catText}" -${catName}` });
            break;
        case "fox":
            await interaction.deferReply({ ephemeral: ephemeral });
            let foxResponse = await axios.get(foxAPI);
            randomEmbed.setImage(foxResponse.data.image);
            break;
    };
    return sendMessage({ interaction: interaction, embeds: randomEmbed, ephemeral: ephemeral });
};

// String options
const captionOption = new SlashCommandStringOption()
    .setName("caption")
    .setDescription("Text to put over the image.");
// Integer options
const minNumberOption = new SlashCommandIntegerOption()
    .setName("number-min")
    .setDescription("Minimum number.")
    .setRequired(true);
const maxNumberOption = new SlashCommandIntegerOption()
    .setName("number-max")
    .setDescription("Maximum number.")
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const numberSubcommand = new SlashCommandSubcommandBuilder()
    .setName("number")
    .setDescription("Generate a random number.")
    .addIntegerOption(minNumberOption)
    .addIntegerOption(maxNumberOption)
    .addBooleanOption(ephemeralOption);
const catSubcommand = new SlashCommandSubcommandBuilder()
    .setName("cat")
    .setDescription("Random cat image.")
    .addStringOption(captionOption)
    .addBooleanOption(ephemeralOption);
const foxSubcommand = new SlashCommandSubcommandBuilder()
    .setName("fox")
    .setDescription("Random fox image.")
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("random")
    .setDescription("Various random results.")
    .addSubcommand(numberSubcommand)
    .addSubcommand(catSubcommand)
    .addSubcommand(foxSubcommand);