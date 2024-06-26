import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import axios from "axios";
import {
    uniqueNamesGenerator,
    names
} from 'unique-names-generator'; // Random name generator that can be seeded

let catAAS = "https://cataas.com/cat";

export default async (interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;

        let catText = interaction.options.getString("text");
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

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

// String options
const textOption = new SlashCommandStringOption()
    .setName("text")
    .setDescription("Text to put over the image.");
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("randomcat")
    .setDescription("Get a random cat image.")
    .addStringOption(textOption)
    .addBooleanOption(ephemeralOption);