const {roulette} = require('../roulette');
const guildID = client.config.botServerID;
const channelID = client.config.botChannelID;

const spin = (channel) =>{
    const result = Math.floor(Math.random()*37);
    const winners = roulette.spin(result);
    channel.send('AAAA')
}

let process = null;

exports.run = (client, message) => {
    try {
        // Import globals
        let globalVars = require('../events/ready');

        if (message.author.id !== globalVars.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        roulette.shift()
        if(roulette.on) process = setTimeout(spin,10000);
        else clearTimeout(process);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
