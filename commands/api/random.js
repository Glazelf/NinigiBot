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

const catAAS = "https://cataas.com/cat";

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });

    switch (interaction.options.getSubcommand()) {
        case "number":
            let lowNumber = interaction.options.getInteger("number-min");
            let highNumber = interaction.options.getInteger("number-max");
            if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
            let randomValue = randomNumber(lowNumber, highNumber);
            return sendMessage({ interaction: interaction, content: `Your random number between \`${lowNumber}\` and \`${highNumber}\` is \`${randomValue}\`.`, ephemeral: ephemeral });
        case "cat":
            let catText = interaction.options.getString("caption");
            let standardCatText = "Meow";
            if (!catText) catText = standardCatText;

            let catAPI = `${catAAS}?json=true`;
            let response = await axios.get(catAPI);
            let catImage = null;
            let catNameSeed = null;
            catImage = `${catAAS}/${response.data._id}`;
            if (catText !== standardCatText) catImage += `/says/${encodeURIComponent(encodeURIComponent(catText))}`; // Double encode to escape periods and slashes
            catNameSeed = response.data._id;
            let catName = uniqueNamesGenerator({
                dictionaries: [names],
                seed: catNameSeed
            });
            const catEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setImage(catImage)
                .setFooter({ text: `"${catText}" -${catName}` });
            return sendMessage({ interaction: interaction, embeds: catEmbed, ephemeral: ephemeral });
    };
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
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("random")
    .setDescription("Various random things.")
    .addSubcommand(numberSubcommand)
    .addSubcommand(catSubcommand);