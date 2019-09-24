exports.run = (client, message, args) => {
    try {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(client.config.lackPerms);

        let numberOfMessages = message.content.slice(7);

        if (isNaN(numberOfMessages)) {
            return message.channel.send(`> Sorry, but "${numberOfMessages}" is not a number, please specify an amount of messages that should be deleted.`);
        };

        if (numberOfMessages > 100) {
            return message.channel.send(`> Sorry, but Discord does not allow more than 100 messages to be deleted at once.`);
        };

        let messageCount = parseInt(numberOfMessages);

        message.channel.fetchMessages({ limit: messageCount })
            .then(messages => message.channel.bulkDelete(messages))
            .then(message.channel.send(`> ${numberOfMessages} messages have been deleted, <@${message.author.id}>.`));
        return;

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`);
    };
};

module.exports.help = {
    name: "Purge",
    description: "Deletes the specified amount of messages.",
    usage: `purge [number]`
};