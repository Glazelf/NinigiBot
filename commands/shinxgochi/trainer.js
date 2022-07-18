
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const api_shinx = require('../../nwu/database/dbServices/shinx.api');
        const api_user = require('../../nwu/database/dbServices/user.api');
        const api_shop = require('../../nwu/database/dbServices/shop.api');

        let ephemeral = false;
        let embed,avatar, trophy_name,res, returnString;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user

        let user, trophies;
        switch (interaction.options.getSubcommand()) {
            case "card":
                user = await api_user.getUser(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setThumbnail(avatar)
                .addFields(
                    { name: "Money:", value: user.money.toString(), inline: true},
                    { name: "Food:", value: user.food.toString(), inline: true},
                )  
                trophies = await user.getShopTrophies();
                trophy_string = '';
                trophies.forEach(trophy=>{
                    trophy_string += ':'+trophy.icon+': ';
                })
                trophies = await user.getShinxTrophies();
                trophies.forEach(trophy=>{
                    trophy_string += ':'+trophy.icon+': ';
                })
                if (trophy_string.length > 0) {
                    embed.addFields(
                        { name: "Trophies:", value: trophy_string},
                    )
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "shop":
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                
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
            case "buy":
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                trophy_name = interaction.options.getString("shop trophy");
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
            case "info":
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)

                /*
                check if in shop, check if in shinx, else return "unknown trophy"
                get the trophy (where OR name, icon)
                show embed with icon, name, description and how to get
                */

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
    name: "trainer",
    description: "Check your trainer stats.",
    options: [{
        name: "card",
        type: "SUB_COMMAND",
        description: "!",
    },{
        name: "shop",
        type: "SUB_COMMAND",
        description: "Check available trophies",
    },{
        name: "buy",
        type: "SUB_COMMAND",
        description: "Buy trophies!",
        options: [{
            name: "shop trophy",
            type: "STRING",
            description: "Item to buy",
            autocomplete: true,
            required: true
        }]
    },{
        name: "info",
        type: "SUB_COMMAND",
        description: "Get info about a trophy",
        options: [{
            name: "trophy",
            type: "STRING",
            description: "Trophy or it's icon",
            autocomplete: true,
            required: true
        }]
    },]
};