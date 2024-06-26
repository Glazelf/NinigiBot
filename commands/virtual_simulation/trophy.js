import {
    EmbedBuilder,
    codeBlock,
    AttachmentBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandBooleanOption,
    SlashCommandStringOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import Canvas from "canvas";
import areEmotesAllowed from "../../util/areEmotesAllowed.js";
import replaceDiscordEmotes from "../../util/trophies/replaceDiscordEmotes.js";
import { getShinx } from "../../database/dbServices/shinx.api.js";
import {
    getFullBuyableShopTrophies,
    buyShopTrophy,
    getShopTrophyWithName,
    getEventTrophyWithName
} from "../../database/dbServices/trophy.api.js";
import getTrophyEmbedSlice from "../../util/trophies/getTrophyEmbedSlice.js";

export default async (interaction, ephemeral) => {
    try {
        let messageFile = null;
        let trophy_name, res;
        let embed = new EmbedBuilder()
            .setColor(globalVars.embedColor);
        let returnString = '';
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        const emotesAllowed = areEmotesAllowed(interaction, ephemeral);
        let master = interaction.user;
        let trophies;
        switch (interaction.options.getSubcommand()) {
            case "stock":
                trophies = await getFullBuyableShopTrophies(master.id);
                if (!emotesAllowed) trophies = replaceDiscordEmotes(trophies);
                trophies.forEach(trophy => {
                    let trophyPriceBlock = codeBlock("diff", `[${trophy.price}]`);
                    let trophy_header = { name: '\u200B', value: `${trophy.icon} **${trophy.trophy_id}**`, inline: true };
                    let trophy_price = { name: '\u200B', value: trophyPriceBlock, inline: true };
                    switch (trophy.temp_bought) {
                        case 'Bought':
                            trophy_price.value = codeBlock("yaml", `Bought`);
                            break;
                        case 'CantBuy':
                            trophy_price.value = codeBlock("css", `[${trophy.price}]`);
                            break;
                        case 'CanBuy':
                            break;
                    };
                    embed.addFields([
                        { name: trophy_header.name, value: trophy_header.value, inline: trophy_header.inline },
                        { name: trophy_price.name, value: trophy_price.value, inline: trophy_price.inline },
                        { name: "\u200B", value: "\u200B", inline: true }
                    ]);
                });
                return sendMessage({
                    interaction: interaction,
                    embeds: [embed],
                    ephemeral: ephemeral
                });
            case "buy":
                trophy_name = interaction.options.getString("shoptrophy");
                res = await buyShopTrophy(master.id, trophy_name.toLowerCase());
                switch (res) {
                    case 'NoTrophy':
                        returnString = `**${trophy_name}** isn't available.\nTip: check today's stock with \`/trophy stock\``;
                        break;
                    case 'HasTrophy':
                        returnString = `You already have **${trophy_name}!**`
                        break;
                    case 'NoMoney':
                        returnString = `Not enough money for **${trophy_name}. **`
                        break;
                    case 'Ok':
                        returnString = `Bought **${trophy_name}**!`
                        shinx = await getShinx(master.id)
                        canvas = Canvas.createCanvas(428, 310);
                        ctx = canvas.getContext('2d');
                        img = await Canvas.loadImage('./assets/frontier.png');
                        ctx.drawImage(img, 0, 0);
                        img = await Canvas.loadImage('./assets/mc.png');
                        ctx.drawImage(img, 51 * !shinx.user_male, 72 * 0, 51, 72, 162, 123, 51, 72);
                        img = await Canvas.loadImage('./assets/fieldShinx.png');
                        ctx.drawImage(img, 57 * 8, 48 * shinx.shiny, 57, 48, 217, 147, 57, 48);
                        img = await Canvas.loadImage('./assets/reactions.png');
                        ctx.drawImage(img, 10 + 30 * 0, 8, 30, 32, 230, 117, 30, 32);

                        messageFile = new AttachmentBuilder(canvas.toBuffer());
                        break;
                };

                return sendMessage({
                    interaction: interaction,
                    content: returnString,
                    files: messageFile,
                    ephemeral: ephemeral || (res != 'Ok')
                });
            case "list":
                let trophy_slice = await getTrophyEmbedSlice(0);
                return sendMessage({
                    interaction: interaction,
                    embeds: [trophy_slice.embed],
                    components: trophy_slice.components,
                    ephemeral: ephemeral,
                });
            case "info":
                trophy_name = interaction.options.getString("trophy");
                res = await getShopTrophyWithName(trophy_name);
                let isShop = true;
                if (!res) { res = await getEventTrophyWithName(trophy_name); isShop = false; }
                if (!res) {
                    return sendMessage({
                        interaction: interaction,
                        content: `**${trophy_name}** doesn't exist.\nTip: check all trophies with \`/trophy list\``,
                        ephemeral: true
                    });
                } else {
                    if (!emotesAllowed) res = replaceDiscordEmotes(res, is_array = false);
                    embed
                        .setTitle(`${res.trophy_id}`)
                        .addFields([
                            { name: "Icon:", value: `${res.icon}`, inline: true },
                            { name: "Description:", value: `${res.description}`, inline: true }
                        ]);
                    let location = `Sometimes found in the Shop.`;
                    if (!isShop) location = res.origin;
                    embed.addFields([{ name: "Location:", value: `${location}`, inline: true }]);
                    return sendMessage({
                        interaction: interaction,
                        embeds: [embed],
                        ephemeral: ephemeral
                    });
                };
        };

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

// String options
const trophyOption = new SlashCommandStringOption()
    .setName("trophy")
    .setDescription("Trophy to show info about.")
    .setAutocomplete(true)
    .setRequired(true);
const shopTrophyOption = new SlashCommandStringOption()
    .setName("shoptrophy")
    .setDescription("Trophy to buy.")
    .setAutocomplete(true)
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const stockSubcommand = new SlashCommandSubcommandBuilder()
    .setName("stock")
    .setDescription("Check today's available trophies.")
    .addBooleanOption(ephemeralOption);
const buySubcommand = new SlashCommandSubcommandBuilder()
    .setName("buy")
    .setDescription("Buy a trophy from the store.")
    .addStringOption(shopTrophyOption);
const listSubcommand = new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("See a lit of all trophies.")
    .addBooleanOption(ephemeralOption);
const infoSubcommand = new SlashCommandSubcommandBuilder()
    .setName("info")
    .setDescription("Get info about a trophy.")
    .addStringOption(trophyOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("trophy")
    .setDescription("Interact with trophies.")
    .addSubcommand(stockSubcommand)
    .addSubcommand(buySubcommand)
    .addSubcommand(listSubcommand)
    .addSubcommand(infoSubcommand);