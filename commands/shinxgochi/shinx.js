

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const shinxApi = require('../../nwu/database/dbServices/shinx.api');
        const api_user = require('../../nwu/database/dbServices/user.api');
        

        let ephemeral = true;
        let shinx, embed,foodArg,res,avatar;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                shinx = await shinxApi.getShinx(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                //const file = new Discord.MessageAttachment('../../assets/shinx.png');
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setTitle(`${master.username}'s Shinx`)
                .addFields(
                    { name: "Nickname:", value: shinx.nickname.toString()},
                    { name: "Level:", value: shinx.getLevel().toString(), inline: true},
                    { name: "Next Level:", value: `${shinx.getNextExperience()} pts.`, inline: true},
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: "Fullness:", value: shinx.getFullnessPercent(), inline: true},
                    { name: "Happiness:", value: shinx.getHappinessPercent(), inline: true},
                )
                let file;
                if(shinx.shiny){
                    file = new Discord.MessageAttachment('./assets/shiny_shinx.png', 'shiny_shinx.png');
                    embed.setThumbnail('attachment://shiny_shinx.png')
                } else {
                    file = new Discord.MessageAttachment('./assets/shinx.png', 'shinx.png');
                    embed.setThumbnail('attachment://shinx.png')
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    files: [file],
                    ephemeral: ephemeral });
            case "addexp":
                let expArg = interaction.options.getInteger("exp");
                await shinxApi.addExperience(master.id, expArg);
                returnString = `Added experience to your Shinx!`;
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
            case "buyfood":
                foodArg = interaction.options.getInteger("food");
                res = await api_user.buyFood(master.id, foodArg);
                returnString = res ? `Added food to your account!`:`Not enough money!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral }); 
                    
            case "shiny":
                const res = await shinxApi.hasShinxTrophy(master.id, 'shiny charm');
                if(res){
                    returnString = (await shinxApi.switchShininessAndGet(master.id))? `Your shinx is shiny now` : `Your shinx is no longer shiny`
                } else {
                    returnString = 'You need that your shinx arrives to level 50 for that.'    
                }
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral }); 
            case "feed":
                foodArg = interaction.options.getInteger("food");
                res = await shinxApi.feedShinx(master.id);
                switch(res){
                    case 'NoHungry':
                        returnString = `Shinx is not hungry!`;
                        break;
                    case 'NoFood':
                        returnString = `You don't have enough food!`
                        break;
                    case 'Ok':
                        returnString = `Feeded Shinx successfully!`
                        break;
                }
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    ephemeral: ephemeral });  
        };
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

// Level and Shiny subcommands are missing on purpose
module.exports.config = {
    name: "shinx",
    description: "Interact with your Shinx.",
    options: [{
        name: "data",
        type: "SUB_COMMAND",
        description: "See your shinx!",
    },{
        name: "addexp",
        type: "SUB_COMMAND",
        description: "Add experience!",
        options: [{
            name: "exp",
            type: "INTEGER",
            description: "The amount of exp you want to add.",
            required: true,
            autocomplete: true
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
            autocomplete: true
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
            autocomplete: true
        }]
    },{
        name: "feed",
        type: "SUB_COMMAND",
        description: "Feed Shinx!"
    },{
        name: "shiny",
        type: "SUB_COMMAND",
        description: "Change shinx's color!"
    }],
};