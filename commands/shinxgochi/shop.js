const Canvas = require('canvas');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const api_shinx = require('../../database/dbServices/shinx.api');
        const api_user = require('../../database/dbServices/user.api');
        const api_badge = require('../../database/dbServices/badge.api');        
        let messageFile = null;
        let ephemeral = true;
        let embed,badge_name,res, returnString;
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeralArg === false) ephemeral = false;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;

        let master = interaction.user

        let  badges;
        switch (interaction.options.getSubcommand()) {
            case "seebadges":
                if (ephemeralArg === false) ephemeral = false;
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                badges = await api_badge.getFullBuyableShopBadges(master.id);
                badges.forEach(badge=>{
                    let badge_header = { name: '\u200B', value: `:${badge.icon}: **${badge.badge_id}**`, inline: true}
                    let badge_price = { name: '\u200B', value: '```diff\n'+`[${badge.price}]`+'\n```', inline: true};
                    
                    switch(badge.temp_bought){
                        case 'Bought':
                            badge_price.value = '```yaml\n+Bought\n```'
                            break;
                        case 'CantBuy':
                            badge_price.value = '```css\n['+`${badge.price}`+']\n```'
                            break;
                        case 'CanBuy':
                            break;
                    }
                    
                    embed.addFields(
                        badge_header,
                        badge_price,
                        { name: '\u200B', value: '\u200B', inline: true },
                    )

                })
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "buybadge":
                badge_name = interaction.options.getString("shopbadge");
                res =  await api_badge.buyShopBadge(master.id, badge_name.toLowerCase());
                returnString = ''
                switch(res){
                    case 'NoBadge':
                        returnString = `**${badge_name}** isn't available.`;
                        break;
                    case 'HasBadge':
                        returnString = `You already have **${badge_name}**`
                        break;
                    case 'NoMoney':
                        returnString = `You don't have enough money for **${badge_name}**`
                        break;
                    case 'Ok':
                        returnString = `Bought **${badge_name}**!`
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
                }

                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    files: messageFile,
                    ephemeral: ephemeral || (res!='Ok') });
            case "buyfood":
                foodArg = interaction.options.getInteger("food");
                const userApi = require('../../database/dbServices/user.api');
                res = await userApi.buyFood(master.id, foodArg);
                returnString = res ? `Added food to your account!`:`Not enough money!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral || res != true }); 
            case "badgelist":

            case "askbadge":

                badge_name = interaction.options.getString("badge");
                res =  await api_badge.getShopBadgeWithName(badge_name);
                let isShop = true;
                if (!res) { res =  await api_badge.getEventBadgeWithName(badge_name); isShop = false;} 
                if (!res) { 
                    embed = null;
                    returnString = `**${badge_name}** doesn't exist.`;
                    break;
                } else {
                    embed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setTitle(`${res.badge_id}`)
                    .addFields(
                        { name: "Icon:", value: `:${res.icon}:`},
                        { name: "Description:", value: `${res.description}`},
                    )
                    let location = `Sometimes found in the Shop.`;
                    if (!isShop){
                        location = res.origin; 
                        
                    } 
                    embed.addFields(
                        { name: "Location", value: location},
                    )

                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral || (res!=true) });
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "shop",
    description: "Interact with the built in shop!",
    options: [{
        name: "seebadges",
        type: "SUB_COMMAND",
        description: "Check available badges",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "buybadge",
        type: "SUB_COMMAND",
        description: "Buy badges!",
        options: [{
            name: "shopbadge",
            type: "STRING",
            description: "Item to buy",
            autocomplete: true,
            required: true
        },{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "askbadge",
        type: "SUB_COMMAND",
        description: "Get info about a badge",
        options: [{
            name: "badge",
            type: "STRING",
            description: "Badge or it's icon",
            autocomplete: true,
            required: true
        },{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "buyfood",
        type: "SUB_COMMAND",
        description: "Buy food!",
        options: [{
            name: "food",
            type: "INTEGER",
            description: "The amount of food you want to buy.",
            required: true,
        },{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "badgelist",
        type: "SUB_COMMAND",
        description: "See a list of all  badges!",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },]
};