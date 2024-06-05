import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import Canvas from "canvas";
import replaceDiscordEmotes from "../../util/trophies/replaceDiscordEmotes.js";
import { getShinx } from "../../database/dbServices/shinx.api.js";
import { getFullBuyableShopTrophies, buyShopTrophy, getShopTrophyWithName, getEventTrophyWithName } from "../../database/dbServices/trophy.api.js";
import getTrophyEmbedSlice from "../../util/trophies/getTrophyEmbedSlice.js";

export default async (client, interaction, ephemeral) => {
    try {
        let messageFile = null;
        let embed, trophy_name, res;
        let returnString = '';
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis)) emotesAllowed = false;
        let master = interaction.user;
        let trophies;
        switch (interaction.options.getSubcommand()) {
            case "stock":
                embed = new Discord.EmbedBuilder()
                    .setColor(globalVars.embedColor)
                trophies = await getFullBuyableShopTrophies(master.id);
                if (!emotesAllowed) trophies = replaceDiscordEmotes(trophies);
                trophies.forEach(trophy => {
                    let trophyPriceBlock = Discord.codeBlock("diff", `[${trophy.price}]`);
                    let trophy_header = { name: '\u200B', value: `${trophy.icon} **${trophy.trophy_id}**`, inline: true };
                    let trophy_price = { name: '\u200B', value: trophyPriceBlock, inline: true };
                    switch (trophy.temp_bought) {
                        case 'Bought':
                            trophy_price.value = Discord.codeBlock("yaml", `Bought`);
                            break;
                        case 'CantBuy':
                            trophy_price.value = Discord.codeBlock("css", `[${trophy.price}]`);
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
                    client: client,
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

                        messageFile = new Discord.AttachmentBuilder(canvas.toBuffer());
                        break;
                };

                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    files: messageFile,
                    ephemeral: ephemeral || (res != 'Ok')
                });
            case "list":
                let trophy_slice = await getTrophyEmbedSlice(0);
                return sendMessage({
                    client: client,
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
                        client: client,
                        interaction: interaction,
                        content: `**${trophy_name}** doesn't exist.\nTip: check all trophies with \`/trophy list\``,
                        ephemeral: true
                    });
                } else {
                    if (!emotesAllowed) res = replaceDiscordEmotes(res, is_array = false);
                    embed = new Discord.EmbedBuilder()
                        .setColor(globalVars.embedColor)
                        .setTitle(`${res.trophy_id}`)
                        .addFields([
                            { name: "Icon:", value: `${res.icon}`, inline: true },
                            { name: "Description:", value: `${res.description}`, inline: true }
                        ]);
                    let location = `Sometimes found in the Shop.`;
                    if (!isShop) location = res.origin;
                    embed.addFields([{ name: "Location:", value: `${location}`, inline: true }]);
                    return sendMessage({
                        client: client,
                        interaction: interaction,
                        embeds: [embed],
                        ephemeral: ephemeral
                    });
                };
        };

    } catch (e) {
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
export const config = {
    name: "trophy",
    description: "Handles all interactions with trophies",
    options: [{
        name: "stock",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: `Check today's available trophies`,
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "buy",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: `Buy a trophy from today's stock`,
        options: [{
            name: "shoptrophy",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Item to buy",
            autocomplete: true,
            required: true
        }]
    }, {
        name: "list",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "See a list of all trophies!",
        options: [{
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "info",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info about a trophy",
        options: [{
            name: "trophy",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Trophy or it's icon",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether this command is only visible to you."
        }]
    }]
};