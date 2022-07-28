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
        const api_shop = require('../../database/dbServices/shop.api');
        
        let messageFile = null;
        let ephemeral = true;
        let embed,trophy_name,res, returnString;
        let canvas, ctx, img, shinx;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeralArg === false) ephemeral = false;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;

        let master = interaction.user

        let  trophies;
        switch (interaction.options.getSubcommand()) {
            case "seetrophies":
                if (ephemeralArg === false) ephemeral = false;
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                trophies = await api_shop.getFullBuyableShopTrophies(master.id);
                trophies.forEach(trophy=>{
                    let trophy_header = { name: '\u200B', value: `:${trophy.icon}: **${trophy.trophy_id}**`, inline: true}
                    let trophy_price = { name: '\u200B', value: '```diff\n'+`[${trophy.price}]`+'\n```', inline: true};
                    
                    switch(trophy.temp_bought){
                        case 'Bought':
                            trophy_price.value = '```yaml\n+Bought\n```'
                            break;
                        case 'CantBuy':
                            trophy_price.value = '```css\n['+`${trophy.price}`+']\n```'
                            break;
                        case 'CanBuy':
                            break;
                    }
                    
                    embed.addFields(
                        trophy_header,
                        trophy_price,
                        { name: '\u200B', value: '\u200B', inline: true },
                    )

                })
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "buytrophy":
                trophy_name = interaction.options.getString("shoptrophy");
                res =  await api_shop.buyShopTrophy(master.id, trophy_name.toLowerCase());
                returnString = ''
                switch(res){
                    case 'NoTrophy':
                        returnString = `**${trophy_name}** isn't available.`;
                        break;
                    case 'HasTrophy':
                        returnString = `You already have **${trophy_name}**`
                        break;
                    case 'NoMoney':
                        returnString = `You don't have enough money for **${trophy_name}**`
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
            case "trophylist":

            case "asktrophy":

                trophy_name = interaction.options.getString("trophy");
                res =  await api_shop.getShopTrophyWithName(trophy_name);
                let isShop = true;
                if (!res) { res =  await api_shinx.getShinxTrophyWithName(trophy_name); isShop = false;} 
                if (!res) { 
                    embed = null;
                    returnString = `**${trophy_name}** doesn't exist.`;
                    break;
                } else {
                    embed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setTitle(`${res.trophy_id}`)
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
        name: "seetrophies",
        type: "SUB_COMMAND",
        description: "Check available trophies",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },{
        name: "buytrophy",
        type: "SUB_COMMAND",
        description: "Buy trophies!",
        options: [{
            name: "shoptrophy",
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
        name: "asktrophy",
        type: "SUB_COMMAND",
        description: "Get info about a trophy",
        options: [{
            name: "trophy",
            type: "STRING",
            description: "Trophy or it's icon",
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
        name: "trophylist",
        type: "SUB_COMMAND",
        description: "See a list of all  trophies!",
        options: [{
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether this command is only visible to you."
        }]
    },]
};