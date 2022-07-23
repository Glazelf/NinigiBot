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
        

        let ephemeral = false;
        let embed,trophy_name,res, returnString;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user

        let  trophies;
        switch (interaction.options.getSubcommand()) {
            case "seetrophies":
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
                        break;
                }

                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });
            case "buyfood":
                foodArg = interaction.options.getInteger("food");
                const userApi = require('../../database/dbServices/user.api');
                res = await userApi.buyFood(master.id, foodArg);
                returnString = res ? `Added food to your account!`:`Not enough money!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral }); 
            case "addmoney":
                let moneyArg = interaction.options.getInteger("money");
                await api_user.addMoney(master.id, moneyArg);
                returnString = `Added money to your account!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral }); 
            case "asktrophy":

                trophy_name = interaction.options.getString("trophy");
                res =  await api_shop.getShopTrophyWithName(trophy_name);
                let isShop = true;
                if (!res) { res =  await api_shinx.getShinxTrophyWithName(trophy_name); isShop = false;} 
                if (!res) { 
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
                    return sendMessage({ 
                        client: client, 
                        interaction: interaction, 
                        embeds: [embed],  
                        ephemeral: ephemeral });
                }
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
        }]
    },{
        name: "addmoney",
        type: "SUB_COMMAND",
        description: "Add money!",
        options: [{
            name: "money",
            type: "INTEGER",
            description: "The amount of money you want to add.",
            required: true,
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
        }]
    },]
};