module.exports = (exception, client, message = null) => {
    // Import globals
    let globalVars = require('../events/ready');

    // log error
    console.log(exception);

    // log to dev channel
    let baseMessage = message ? `An error occurred in ${message.channel}!
Link: ${message.url}
Error:
\`\`\`${exception}\`\`\`
Message by ${message.author.tag}:
\`\`\`${message.content}\`\`\`` : `An error occurred:
\`\`\`${exception}\`\`\``;
    if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...\`\`\``;
    let devChannel = client.shard.broadcastEval(`this.channels.get("${client.config.devChannelID}")`);
    if (message) message.channel.send(`> An error has occurred. 
> The error has already been logged but please also report this as an issue on Github: 
> <https://github.com/Glazelf/NinigiBot/issues>`);
    return devChannel.send(baseMessage);
};