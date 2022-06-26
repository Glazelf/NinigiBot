
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { nwu_db } = require('../../nwu/database/dbServices');
        const Discord = require("discord.js");

        let ephemeral = true;
        let shinx, embed,foodArg,res,avatar;
        await interaction.deferReply({ ephemeral: ephemeral });

        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                shinx = await nwu_db.services.getShinx(master.id);
                //let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //let avatar = new Discord.THU();
                //const file = new Discord.MessageAttachment('../../assets/shinx.png');
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
                //console.log(`shinx ${shinx.nickname} ${shinx.fullness} ${shinx.happiness} ${shinx.experience}`)
                embed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: client.user.username })
                .setThumbnail(avatar)
                .addFields(
                    { name: "Nickname:", value: shinx.nickname.toString()},
                    { name: "Level:", value: shinx.getLevel().toString(), inline: true},
                    { name: "Experience:", value: shinx.experience.toString(), inline: true},
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: "Fullness:", value: shinx.fullness.toString(), inline: true},
                    { name: "Happiness:", value: shinx.happiness.toString(), inline: true},
                )
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    embeds: [embed],  
                    ephemeral: ephemeral });
            case "addexp":
                let expArg = interaction.options.getInteger("exp");
                await nwu_db.services.addExperience(master.id, expArg);
                returnString = `Added experience to your Shinx!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });
            case "addmoney":
                let moneyArg = interaction.options.getInteger("money");
                await nwu_db.services.addMoney(master.id, moneyArg);
                returnString = `Added money to your account!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral }); 
            case "buyfood":
                foodArg = interaction.options.getInteger("food");
                res = await nwu_db.services.buyFood(master.id, foodArg);
                returnString = res ? `Added food to your account!`:`Not enough money!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });  
            case "feed":
                foodArg = interaction.options.getInteger("food");
                res = await nwu_db.services.feedShinx(master.id);
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
    }],
};