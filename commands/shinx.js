const UserItems = require('../database/models/UserItems');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const { bank } = require('../database/bank');
        const Discord = require("discord.js");
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);

        const shinx = await bank.currency.getShinx(message.author.id)
        console.log(biography)
        let userCache = client.users.cache.get(message.author.id);
        if(biography==='shiny') return shinx.shine()? message.channel.send('Now your shinx shines!'):message.channel.send('Your shinx doesn\'t shine anymmore!')
        if(biography==='nick') return shinx.changeNick('Glaze')
        if(biography==='level') return message.channel.send(`Shinx levels up to level ${shinx.levelUp(1)}`); 
        let avatar = null;
        console.log(shinx)
        if (userCache.avatarURL()) avatar = userCache.avatarURL({ format: "png", dynamic: true });
        const shinxData = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setTitle('Shinx data')
            .setAuthor(userCache.username, avatar)
            .addField("Nick:", shinx.nick, true)
            .addField("Level:", shinx.level, true)
            .addField("Hunger:", shinx.hunger+'%', true)
            .addField("Sleep:", shinx.sleep+'%', true)
            .addField("Friendship:", shinx.friendship+'%', true)
            console.log(shinx.shiny)
            shinx.shiny? shinxData.setImage('https://media.redadn.es/imagenes/pokemon-go-android-ios_323027.jpg'): shinxData.setImage('https://img.pngio.com/others-png-download-1115985-free-transparent-pokemon-x-and-y-shinx-png-900_800.jpg')
            .setTimestamp();

        return message.channel.send(shinxData);
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};