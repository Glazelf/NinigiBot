const Canvas = require('canvas');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const shinxApi = require('../../database/dbServices/shinx.api');
        const trainerApi = require('../../database/dbServices/trainer.api');
        
        let ephemeral = true;
        let shinx, embed,foodArg,res,avatar;
        await interaction.deferReply({ ephemeral: ephemeral });
        let canvas, ctx, img;

        let master = interaction.user
        switch (interaction.options.getSubcommand()) {
            case "data":
                shinx = await shinxApi.getShinx(master.id);
                const is_trainer_male = await trainerApi.isMale(master.id);
                const applyText = require('../../util/applyCanvasText')
                avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

                canvas = Canvas.createCanvas(791, 441);
                ctx = canvas.getContext('2d');
                img = await Canvas.loadImage('./assets/data.png');

                ctx.drawImage(img, 0, 0);
                if (shinx.shiny) {
                    const cap = await Canvas.loadImage('./assets/shiny.png');
                    ctx.drawImage(cap, 97, 202);
                };

                img = await Canvas.loadImage('./assets/owner.png');
                ctx.drawImage(img, 48 * !is_trainer_male, 0, 47 + 9 * !is_trainer_male, 70, 407, 300,        47 + 9 * !is_trainer_male, 70);
                ctx.drawImage(img, 59 * !is_trainer_male, 71, 59 - 5 * !is_trainer_male, 49, 398, 156,        59 - 5 * !is_trainer_male, 49);
                ctx.font = applyText(canvas, shinx.nickname, 45, 266);
                ctx.fillStyle = '#FFFFFF';

                ctx.fillText(shinx.nickname, 88, 133);
                ctx.font = applyText(canvas, master.username, 35, 228);

                if (shinx.user_male) {
                    ctx.fillStyle = '#0073FF';
                } else {
                    ctx.fillStyle = 'red';
                };

                ctx.fillText(master.username, 490, 190);
                ctx.font = 'normal bolder 35px Arial';
                ctx.fillStyle = '#000000';
                ctx.fillText(shinx.getLevel(), 93, 180);
                ctx.fillText(shinx.getFullnessPercent(), 490, 251);
                ctx.fillText(shinx.meetup, 490, 364);

                messageFile = new Discord.MessageAttachment(canvas.toBuffer());
                return sendMessage({ client: client, interaction: interaction, files: messageFile });

                // embed = new Discord.MessageEmbed()
                // .setColor(globalVars.embedColor)
                // .setTitle(`${master.username}'s Shinx`)
                // .addFields(
                //     { name: "Nickname:", value: shinx.nickname.toString()},
                //     { name: "Level:", value: shinx.getLevel().toString(), inline: true},
                //     { name: "Next Level:", value: `${shinx.getNextExperience()} pts.`, inline: true},
                //     { name: '\u200B', value: '\u200B', inline: true },
                //     { name: "Fullness:", value: shinx.getFullnessPercent(), inline: true},
                // )
                // let file;
                // if(shinx.shiny){
                //     file = new Discord.MessageAttachment('./assets/shiny_shinx.png', 'shiny_shinx.png');
                //     embed.setThumbnail('attachment://shiny_shinx.png')
                // } else {
                //     file = new Discord.MessageAttachment('./assets/shinx.png', 'shinx.png');
                //     embed.setThumbnail('attachment://shinx.png')
                // }
                // return sendMessage({ 
                //     client: client, 
                //     interaction: interaction, 
                //     embeds: [embed],  
                //     files: [file],
                //     ephemeral: ephemeral });
            case "addexp":
                let expArg = interaction.options.getInteger("exp");
                await shinxApi.addExperience(master.id, expArg);
                returnString = `Added experience to your Shinx!`;
                return sendMessage({ 
                    client: client, 
                    interaction: interaction, 
                    content: returnString, 
                    ephemeral: ephemeral });
            case "changenick":
                let new_nick = interaction.options.getString("nickname");
                res = await shinxApi.nameShinx(master.id, new_nick);
                switch(res){
                    case 'TooShort':
                        returnString = `Could not rename because provided nickname was empty`;
                        break;
                    case 'TooLong':
                        returnString = `Could not rename because provided nickname length was greater than 12`
                        break;
                    case 'InvalidChars':
                        returnString = `Could not rename because provided nickname was not alphanumeric`
                        break;
                    case 'Ok':
                        returnString = `Shinx renamed successfully!`
                        break;
                }
                return sendMessage({
                    client: client,
                    interaction: interaction,
                    content: returnString,
                    ephemeral: ephemeral }); 

            case "shiny":
                res = await shinxApi.hasShinxTrophy(master.id, 'shiny charm');
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
        name: "changenick",
        type: "SUB_COMMAND",
        description: "Change your Shinx nickname!",
        options: [{
            name: "nickname",
            type: "STRING",
            description: "Alphanumeric string (between 1 and 12 characters)",
            required: true
        }]
    },{
        name: "addexp",
        type: "SUB_COMMAND",
        description: "Add experience!",
        options: [{
            name: "exp",
            type: "INTEGER",
            description: "The amount of exp you want to add.",
            required: true,
        }]
    },{
        name: "feed",
        type: "SUB_COMMAND",
        description: "Feed Shinx!"
    },{
        name: "shiny",
        type: "SUB_COMMAND",
        description: "Change shinx's color!"
    },{
        name: "dataImage",
        type: "SUB_COMMAND",
        description: "Get your Shinx data animated!",
    },],
};