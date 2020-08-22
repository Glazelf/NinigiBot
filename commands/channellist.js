exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.reply(globalVars.lackPerms)
        };

        let guildID = message.content.slice(13);
        let guild = client.guilds.cache.get(guildID);

        if (!guild) return message.channel.send(`> I couldn't find that server, ${message.author}.`);

        let baseMessage = `> Here's a list of all channels for ${guild.name}, ${message.author}:`;

        guild.channels.cache.forEach((channel) => {
            baseMessage = `${baseMessage}
> -${channel.name} - ${channel.id}`
        });

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
