const Canvas = require('canvas');
const replaceDiscordEmotes = require('../../util/trophies/replaceDiscordEmotes');
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const api_shinx = require('../../database/dbServices/shinx.api');
        const api_user = require('../../database/dbServices/user.api');
        const api_trophy = require('../../database/dbServices/trophy.api');
        let messageFile = null;
        let ephemeral = true;
        let embed, trophy_name, res;
        let returnString = ''
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeralArg === false) ephemeral = false;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        let master = interaction.user;
        let trophies;
        switch (interaction.options.getSubcommand()) {
            case "stock":
                if (ephemeralArg === false) ephemeral = false;
                embed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                trophies = await api_trophy.getFullBuyableShopTrophies(master.id);
                if (!emotesAllowed) trophies = replaceDiscordEmotes(trophies);
                trophies.forEach(trophy => {
                    let trophy_header = { name: '\u200B', value: `${trophy.icon} **${trophy.trophy_id}**`, inline: true };
                    let trophy_price = { name: '\u200B', value: '```diff\n' + `[${trophy.price}]` + '\n```', inline: true };

                    switch (trophy.temp_bought) {
                        case 'Bought':
                            trophy_price.value = '```yaml\n+Bought\n```'
                            break;
                        case 'CantBuy':
                            trophy_price.value = '```css\n[' + `${trophy.price}` + ']\n```'
                            break;
                        case 'CanBuy':
                            break;
                    };
                    embed
                        .addField(trophy_header.name, trophy_header.value, trophy_header.inline)
                        .addField(trophy_price.name, trophy_price.value, trophy_price.inline)
                        .addField("\u200B", "\u200B", true);
                });
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    embeds: [embed],
                    ephemeral: ephemeral
                });
            case "buy":
                trophy_name = interaction.options.getString("shoptrophy");
                res = await api_trophy.buyShopTrophy(master.id, trophy_name.toLowerCase());
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
                        shinx = await api_shinx.getShinx(master.id)
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

                        messageFile = new Discord.MessageAttachment(canvas.toBuffer());
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
                let trophy_slice = await require('../../util/trophies/getTrophyEmbedSlice')(0);
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    embeds: [trophy_slice.embed],
                    components: trophy_slice.components,
                    ephemeral: ephemeral,
                });

            case "ask":

                trophy_name = interaction.options.getString("trophy");
                res = await api_trophy.getShopTrophyWithName(trophy_name);
                let isShop = true;
                if (!res) { res = await api_trophy.getEventTrophyWithName(trophy_name); isShop = false; }
                if (!res) {
                    return sendMessage({
                        client: client,
                        interaction: interaction,
                        content: `**${trophy_name}** doesn't exist.\nTip: check all trophies with \`/trophy list\``,
                        ephemeral: true
                    });
                } else {
                    if (!emotesAllowed) res = replaceDiscordEmotes(res, is_array = false);
                    embed = new Discord.MessageEmbed()
                        .setColor(globalVars.embedColor)
                        .setTitle(`${res.trophy_id}`)
                        .addField("Icon:", `${res.icon}`, true)
                        .addField("Description:", `${res.description}`, true)
                    let location = `Sometimes found in the Shop.`;
                    if (!isShop) location = res.origin;
                    embed.addField("Location:", `${location}`, true);
                    return sendMessage({
                        client: client,
                        interaction: interaction,
                        embeds: [embed],
                        ephemeral: ephemeral
                    });

                }
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "trophy",
    description: "Handles all interactions with trophies",
    options: [{
        name: "stock",
        type: "SUB_COMMAND",
        description: `Check today's available trophies`,
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "buy",
        type: "SUB_COMMAND",
        description: `Buy a trophy from today's stock`,
        options: [{
            name: "shoptrophy",
            type: "STRING",
            description: "Item to buy",
            autocomplete: true,
            required: true
        }]
    }, {
        name: "list",
        type: "SUB_COMMAND",
        description: "See a list of all trophies!",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }, {
        name: "ask",
        type: "SUB_COMMAND",
        description: "Get info about a trophy",
        options: [{
            name: "trophy",
            type: "STRING",
            description: "Trophy or it's icon",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    }]
};