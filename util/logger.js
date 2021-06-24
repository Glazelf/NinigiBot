module.exports = async (exception, client, message = null) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const getTime = require('./getTime');

        let timestamp = await getTime();

        // log error
        console.log(`Error at ${timestamp}:`);
        console.log(exception);

        let user;
        if (message) {
            if (message.member) {
                user = message.member.user;
            };
        };

        // Stop typing
        if (message) message.channel.stopTyping(true);

        // log to dev channel
        let baseMessage;
        baseMessage = message && user ? `An error occurred in ${message.channel}!
Link: ${message.url}
Error:
\`\`\`${exception}\`\`\`
Message by ${user.tag}:
\`\`\`${message.content}\`\`\`` : `An error occurred:
\`\`\`${exception}\`\`\``;

        if (!message.author) return;

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...\`\`\``;
        // Fix cross-shard logging sometime
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        if (message) {
            if (baseMessage.includes("Missing Permissions")) {
                return message.reply(`I lack permissions to perform the requested action.`);
            } else if (baseMessage.includes("Missing Access")) {
                return;
            } else {
                message.reply(`An error has occurred. 
The error has already been logged but please also report this as an issue on Github: 
<https://github.com/Glazelf/NinigiBot/issues>`);
                return devChannel.send({ content: baseMessage });
            };
        };

    } catch (e) {
        console.log(e);
    };
};