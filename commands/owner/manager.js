import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import checker from "../../util/string/checkFormat.js";
import { checkTrophyExistance, createShopTrophy, deleteShopTrophy } from "../../database/dbServices/trophy.api.js";
import isOwner from "../../util/isOwner.js";

export default async (client, interaction, ephemeral) => {
    try {
        ephemeral = true;
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;

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
                    let errorBlock = Discord.codeBlock(error);
                    returnString = `Could not add the trophy due to the following issues:${errorBlock}`;
                } else {
                    await createShopTrophy(trophy_name, trophy_emote, trophy_desc, trophy_price);
                    returnString = `${trophy_name} added successfully to the shop!`;
                };
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    ephemeral: true
                });
            case "deleteshoptrophy":
                trophy_name = interaction.options.getString("name").trim();
                res = await deleteShopTrophy(trophy_name);
                returnString = res ? `${trophy_name} deleted successfully from the shop!` : `${trophy_name} does not exist in the __shop__`;
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    ephemeral: true
                });
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
export const config = {
    name: "manager",
    description: "Owner only, manage multiple aspects about Ninigi Virtual Simulation Core",
    serverID: ["759344085420605471"],
    options: [{
        name: "addshoptrophy",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Owner only, add a custom trophy to the shop.",
        options: [{
            name: "name",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Name of the trophy. Make sure it's unique with less than 25 characters!",
            required: true
        }, {
            name: "emote",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Icon of the trophy. Make sure it's a valid emote.",
            required: true
        }, {
            name: "description",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Description of the trophy",
            required: true
        }, {
            name: "price",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "Amount of money to charge for it",
            required: true,
        },]
    }, {
        name: "deleteshoptrophy",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Owner only, delete a trophy from the shop",
        options: [{
            name: "name",
            type: Discord.ApplicationCommandOptionType.String,
            autocomplete: true,
            description: "Name of the trophy. Make sure it's valid!",
            required: true
        }]
    }]
};