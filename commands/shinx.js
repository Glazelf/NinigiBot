const UserItems = require('../database/models/UserItems');
const Canvas = require('canvas');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        const shinx = await bank.currency.getShinx(message.author.id)
        let userCache = client.users.cache.get(message.author.id);
        if(biography==='shiny') return shinx.shine()? message.channel.send('Now your shinx shines!'):message.channel.send('Your shinx doesn\'t shine anymmore!')
        if(biography==='nick') return shinx.changeNick('Glaze')
        if(biography==='level') return message.channel.send(`Shinx levels up to level ${shinx.levelUp(1)}`); 
        let avatar = null;
        const canvas = Canvas.createCanvas(791, 541);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage('./assets/data.png');
        ctx.drawImage(background, 0, 0);
        if(shinx.shiny){
            const cap = await Canvas.loadImage('./assets/shiny.png');
            ctx.drawImage(cap, 98, 206);
        }
        ctx.font = 'normal bolder 45px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(shinx.nick, 88, 133);
        ctx.font = 'normal bolder 35px Arial';
        ctx.fillStyle = '#0073FF'
        ctx.fillText(message.author.username, 490, 190);
        ctx.fillStyle = '#000000'
        ctx.fillText(shinx.level, 93, 191);
        ctx.fillText(Math.floor(shinx.hunger*100)+'%', 490, 251);
        ctx.fillText(Math.floor(shinx.sleep*100)+'%', 490, 310);
        ctx.fillText(Math.floor(shinx.friendship*100)+'%', 490, 364);
        ctx.fillText(shinx.meetup, 490, 481);
        if (userCache.avatarURL()) avatar = userCache.avatarURL({ format: "png", dynamic: true });
        const shinxData = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

        return message.channel.send(shinxData);
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};