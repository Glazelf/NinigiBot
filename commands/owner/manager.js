import {
    codeBlock,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandIntegerOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import checker from "../../util/string/checkFormat.js";
import {
    checkTrophyExistance,
    createShopTrophy,
    deleteShopTrophy
} from "../../database/dbServices/trophy.api.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    ephemeral = true;
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    let trophy_name, res, returnString;
    const regexpUnicode = /\p{RI}\p{RI}|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(\u{200D}\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?)+|\p{EPres}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?|\p{Emoji}(\p{EMod}+|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})/gu;
    const regexpDiscord = /<a*:[a-zA-Z0-9]+:[0-9]+>/;

    switch (interaction.options.getSubcommand()) {
        case "addshoptrophy":
            let error = '';
            trophy_name = interaction.options.getString("name").trim();
            switch (checker(trophy_name, 25)) {
                case "TooShort":
                    error += 'Name too short\n';
                case "TooLong":
                    error += 'Name exceeds 25 characters\n';
                case "InvalidChars":
                    error += 'Name has invalid characters\n';
            };
            res = await checkTrophyExistance(trophy_name);
            if (res == true) error += 'Name already used\n';
            const trophy_desc = interaction.options.getString("description").trim();
            switch (checker(trophy_desc, 1024, false)) {
                case "TooShort":
                    error += 'Description too short\n';
                case "TooLong":
                    error += 'Description exceeds 25 characters\n';
                case "InvalidChars":
                    error += 'Description has invalid characters\n';
            };
            let trophy_emote = interaction.options.getString("emote").trim().replace(/^:+/, '').replace(/:+$/, '');
            let parsed_emote = trophy_emote.match(regexpDiscord);
            if (!parsed_emote) {
                parsed_emote = trophy_emote.match(regexpUnicode)
                if (!parsed_emote) error += 'Emote is not a valid Unicode Emoji or Discord custom emote';
            };
            if (parsed_emote) trophy_emote = parsed_emote[0];

            const trophy_price = interaction.options.getInteger("price");
            if (trophy_price < 1) error += 'Price cannot be lower than 1';

            if (error.length > 0) {
                let errorBlock = codeBlock(error);
                returnString = `Could not add the trophy due to the following issues:${errorBlock}`;
            } else {
                await createShopTrophy(trophy_name, trophy_emote, trophy_desc, trophy_price);
                returnString = `${trophy_name} added successfully to the shop!`;
            };
            return sendMessage({
                interaction: interaction,
                content: returnString,
                ephemeral: true
            });
        case "deleteshoptrophy":
            trophy_name = interaction.options.getString("name").trim();
            res = await deleteShopTrophy(trophy_name);
            returnString = res ? `${trophy_name} deleted successfully from the shop!` : `${trophy_name} does not exist in the __shop__`;
            return sendMessage({
                interaction: interaction,
                content: returnString,
                ephemeral: true
            });
    };
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
    .setDMPermission(false)
    .addSubcommand(addShopTrophySubcommand)
    .addSubcommand(deleteShopTrophySubcommand);