import {
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption,
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import checker from "../../util/string/checkFormat.js";
import { checkTrophyExistance, createShopTrophy, deleteShopTrophy } from "../../database/dbServices/trophy.api.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    ephemeral = true;
    if (!await isOwner(interaction.client, interaction.user)) {
        return sendMessage({ interaction, content: globalVars.lackPermsString });
    };

    let returnString;
    const subcommand = interaction.options.getSubcommand();
    try {
        switch (subcommand) {
            case "addshoptrophy":
                returnString = await handleAddShopTrophy(interaction);
                break;
            case "deleteshoptrophy":
                returnString = await handleDeleteShopTrophy(interaction);
                break;
            // Add other subcommands here
            default:
                returnString = "Invalid subcommand.";
        };
    } catch (error) {
        returnString = `Error: ${error.message}`;
    };

    return sendMessage({ interaction, content: returnString, ephemeral });
};

async function handleAddShopTrophy(interaction) {
    let error = '';
    const trophyName = interaction.options.getString("name").trim();
    if (!validateInput(trophyName, 25)) {
        error += 'Invalid trophy name.\n';
    };
    if (await checkTrophyExistance(trophyName)) {
        error += 'Trophy name already used.\n';
    };
    const trophyDesc = interaction.options.getString("description").trim();
    if (!validateInput(trophyDesc, 1024)) {
        error += 'Invalid trophy description.\n';
    };
    const trophyEmote = validateEmote(interaction.options.getString("emote").trim());
    if (!trophyEmote) {
        error += 'Invalid emote.\n';
    };
    const trophyPrice = interaction.options.getInteger("price");

    if (error) throw new Error(error);
    await createShopTrophy(trophyName, trophyDesc, trophyEmote, trophyPrice);
    return 'Trophy added successfully.';
};

async function handleDeleteShopTrophy(interaction) {
    const trophyName = interaction.options.getString("name").trim();
    if (!await checkTrophyExistance(trophyName)) {
        throw new Error('Trophy name does not exist.');
    }
    await deleteShopTrophy(trophyName);
    return 'Trophy deleted successfully.';
};

function validateInput(input, maxLength) {
    const result = checker(input, maxLength);
    return result === "Valid";
};

function validateEmote(emote) {
    const regexpUnicode = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)+|\p{EPres}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})/gu;
    const regexpDiscord = /<a*:[a-zA-Z0-9]+:[0-9]+>/;
    return emote.match(regexpDiscord) || emote.match(regexpUnicode);
};

export const guildID = config.devServerID;

// Level and Shiny subcommands are missing on purpose
// String options
const nameCreateOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Name of the trophy. Make sure it's unique!")
    .setMaxLength(24)
    .setRequired(true);
const nameFindOption = new SlashCommandStringOption()
    .setName("name")
    .setDescription("Name of the trophy. Make sure it's valid!")
    .setAutocomplete(true)
    .setRequired(true);
const emoteOption = new SlashCommandStringOption()
    .setName("emote")
    .setDescription("Icon of the trophy. Make sure it's a valid emote.")
    .setRequired(true);
const descriptionOption = new SlashCommandStringOption()
    .setName("description")
    .setDescription("Description of the trophy.")
    .setRequired(true);
// Integer options
const priceOption = new SlashCommandIntegerOption()
    .setName("price")
    .setDescription("Amount of money the trophy will cost.")
    .setRequired(true);
// Subcommands
const addShopTrophySubcommand = new SlashCommandSubcommandBuilder()
    .setName("addshoptrophy")
    .setDescription("Add a custom trophy to the shop.")
    .addStringOption(nameCreateOption)
    .addStringOption(emoteOption)
    .addStringOption(descriptionOption)
    .addIntegerOption(priceOption);
const deleteShopTrophySubcommand = new SlashCommandSubcommandBuilder()
    .setName("deleteshoptrophy")
    .setDescription("Delete a trophy from the shop.")
    .addStringOption(nameFindOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("manager")
    .setDescription("Manage multiple aspects about Ninigi Virtual Simulation Core.")
    .setContexts([InteractionContextType.Guild])
    .addSubcommand(addShopTrophySubcommand)
    .addSubcommand(deleteShopTrophySubcommand);