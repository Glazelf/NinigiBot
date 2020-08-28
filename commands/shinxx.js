const UserItems = require('../database/models/UserItems');
const Canvas = require('canvas');

module.exports.run = async (client, message) => {
    // Import globals

    let globalVars = require('../events/ready');
    const reactions = [
        //10, 8 empieza, con ancho 30, 32
        ['is sleeping. Shh!',[49, 0, 57, 40], null],
        ['feels happy today!',[0, 0, 50, 48], 0],
        ['seems to be a bit hungry...',[0, 48, 53, 38], 10]

    ]
    try {
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        const shinx = await bank.currency.getShinx(message.author.id)
        let userCache = client.users.cache.get(message.author.id);
        const canvas = Canvas.createCanvas(468, 386);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage('./assets/room.png');
        ctx.drawImage(background, 0, 0);
        const now = new Date();
        let img = null;
        if(shinx.shiny) img = await Canvas.loadImage('./assets/fieldShinxx.png');
        else img = await Canvas.loadImage('./assets/fieldShinx.png');
        const reaction = reactions[Math.floor(Math.random()*reactions.length)]
        const shinxFrame = reaction[1]
        ctx.drawImage(img, shinxFrame[0], shinxFrame[1], shinxFrame[2], shinxFrame[3], 284, 177, shinxFrame[2], shinxFrame[3] )
        if(!isNaN(reaction[2])){
            img = await Canvas.loadImage('./assets/reactions.png');
            ctx.drawImage(img, 10+30*reaction[2], 8, 30, 32, 289, 147, 30, 32)
        }
        if(now.getHours()> 20||now.getHours()<6){
            img = await Canvas.loadImage('./assets/winNight.png');
            ctx.drawImage(img, 198, 52);
        }
        const shinxData = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
        return message.channel.send(`${shinx.nick} ${reaction[0]}`, shinxData);
        `
        What you want to do?
        -feed
        -pat
        -play
        `
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};