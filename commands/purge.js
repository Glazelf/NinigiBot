exports.run = (client, message, args) => {
    var numberOfMessages = message.content.slice(7);
    if(isNaN(numberOfMessages)){
        message.channel.send(`Sorry, but "${numberOfMessages}" is not a number, please specify an amount of messages that should be deleted.`);
    } else {
    let messageCount = parseInt(numberOfMessages);
    message.channel.fetchMessages({ limit: messageCount })
        .then(messages => message.channel.bulkDelete(messages))
        .then(message.channel.send(`${numberOfMessages} messages have been deleted.`))
    }
};

module.exports.help = {
    name: "Purge",
    description: "Deletes the specified amount of messages.",
    usage: `purge [number]`
};
