module.exports = async (exception, client, message = null) => {
    // Import globals
    let globalVars = require('../events/ready');

    // log error
    console.log(exception);

    if (message) message.channel.stopTyping(true);

    // log to dev channel
    let baseMessage = message ? `An error occurred in ${message.channel}!
Link: ${message.url}
Error:
\`\`\`${exception}\`\`\`
Message by ${message.author.tag}:
\`\`\`${message.content}\`\`\`` : `An error occurred:
\`\`\`${exception}\`\`\``;
    if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...\`\`\``;
    let devChannel = await client.shard.broadcastEval(`this.channels.cache.get(channel => channel.id == ${client.config.devChannelID})`);
    console.log(devChannel)
    if (message) message.channel.send(`> An error has occurred. 
> The error has already been logged but please also report this as an issue on Github: 
> <https://github.com/Glazelf/NinigiBot/issues>`);
    return devChannel.send(baseMessage);
};