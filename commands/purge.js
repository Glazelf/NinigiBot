exports.run = (client, message) => {
    try {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(client.config.lackPerms);

        let numberFromMessage = message.content.slice(7);
        let numberFromMessagestoNumber = Number(numberFromMessage);
        let numberOfMessages = numberFromMessagestoNumber + 1;

        if (isNaN(numberOfMessages)) {
            return message.channel.send(`> Sorry, but "${numberOfMessages}" is not a number, please specify an amount of messages that should be deleted.`);
        };

        if (numberOfMessages > 100) {
            return message.channel.send(`> Sorry, but Discord does not allow more than 100 messages to be deleted at once.`);
        };

        let messageCount = parseInt(numberOfMessages);

        message.channel.messages.fetch({ limit: messageCount })
            .then(messages => message.channel.bulkDelete(messages))
            .then(message.channel.send(`> ${numberOfMessages} messages have been deleted, <@${message.author.id}>.`));
        return;

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Purge",
    description: "Deletes the specified amount of messages.",
    usage: `purge [number]`
};