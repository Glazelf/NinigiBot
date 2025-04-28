import {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
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
import sendMessage from "../../util/discord/sendMessage.js";
import randomNumber from "../../util/math/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const catAPI = "https://cataas.com/cat";
const foxAPI = "https://randomfox.ca/floof/";
const errorAPI = "An error occurred with the API. Please try again later.";

export default async (interaction, messageFlags) => {
    messageFlags.add(MessageFlags.IsComponentsV2);
    let randomContainer = new ContainerBuilder()
        .setAccentColor(globalVars.embedColor);
    switch (interaction.options.getSubcommand()) {
        case "number":
            let lowNumber = interaction.options.getInteger("number-min");
            let highNumber = interaction.options.getInteger("number-max");
            if (lowNumber > highNumber) [lowNumber, highNumber] = [highNumber, lowNumber]; // Flip variables in case lowNumber is higher. randomNumber() does this too but we do it again here to keep the end string sorted from low to high
            let randomValue = randomNumber(lowNumber, highNumber);
            let randomTextDisplay = new TextDisplayBuilder()
                .setContent(`# ${randomValue}\n-# Min: ${lowNumber}\n-# Max: ${highNumber}`);
            randomContainer.addTextDisplayComponents(randomTextDisplay);
            break;
        case "cat":
            await interaction.deferReply({ flags: messageFlags });
            let catText = interaction.options.getString("caption");
            let standardCatText = "Meow";
            if (!catText) catText = standardCatText;

            let catResponse = await axios.get(`${catAPI}?json=true`).catch(e => { return null; });
            if (!catResponse) return sendMessage({ interaction: interaction, content: errorAPI });
            let catImage = null;
            let catImageID = catResponse.data.id;
            catImage = `${catAPI}/${catImageID}`;
            if (catText !== standardCatText) catImage += `/says/${encodeURIComponent(encodeURIComponent(catText).replace(/%20/g, " "))}`; // Double encode to escape periods and slashes. Replace first encode's spaces to show those correctly
            let catName = uniqueNamesGenerator({
                dictionaries: [names],
                seed: catImageID
            });
            let catQuote = new TextDisplayBuilder()
                .setContent(`"${catText}" -${catName}`);
            let catImageGalleryItem = new MediaGalleryItemBuilder()
                .setURL(catImage);
            let catImageGallery = new MediaGalleryBuilder()
                .addItems([catImageGalleryItem]);
            randomContainer
                .addMediaGalleryComponents(catImageGallery)
                .addTextDisplayComponents(catQuote)
            break;
        case "fox":
            await interaction.deferReply({ flags: messageFlags });
            let foxResponse = await axios.get(foxAPI);
            let randomFoxImageGalleryItem = new MediaGalleryItemBuilder()
                .setURL(foxResponse.data.image);
            let foxImageGallery = new MediaGalleryBuilder()
                .addItems([randomFoxImageGalleryItem]);
            randomContainer
                .addMediaGalleryComponents(foxImageGallery)
            break;
    };
    return sendMessage({ interaction: interaction, components: [randomContainer], flags: messageFlags });
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