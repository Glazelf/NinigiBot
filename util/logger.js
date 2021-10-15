module.exports = async (exception, client, message = null) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");
        const getTime = require('./getTime');
        let timestamp = await getTime(client);

        // Log error
        console.log(`Error at ${timestamp}:`);
        console.log(exception);

        let user;
        if (message) {
            if (message.member) user = message.author;
        };

        let exceptionCode = Discord.Formatters.codeBlock(exception);
        let messageContentCode = "";
        if (message && message.content && message.content.length > 0) messageContentCode = Discord.Formatters.codeBlock(message.content);

        // log to dev channel
        let baseMessage;
        baseMessage = message && user ? `An error occurred in ${message.channel}!
Link: ${message.url}
Error:\n${exceptionCode}
Message by **${user.tag}** (${user.id}):
${messageContentCode}` : `An error occurred:\n${exceptionCode}`;

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1997) + `...`;
        // Fix cross-shard logging sometime
        let devChannel = await client.channels.fetch(client.config.devChannelID);
        if (message) {
            if (baseMessage.includes("Missing Permissions")) {
                try {
                    return message.reply(`I lack permissions to perform the requested action.`);
                } catch (e) {
                    return;
                };
            } else if (baseMessage.includes("Missing Access")) {
                return;
            } else {
                let errorReturnText = `An error has occurred. 
The error has already been logged but please also report this as an issue on Github: 
<https://github.com/Glazelf/NinigiBot/issues>`;
                if (message && !message.deleted) message.reply(errorReturnText);
                return devChannel.send({ content: baseMessage });
            };
        };

    } catch (e) {
        console.log(e);
    };
};