exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(`${client.config.lackPerms}`)
    }
    // send channel a message that you're resetting bot [optional]
    message.channel.send(message.content)
};

module.exports.help = {
    name: "Say",
    description: "Replies with the same message you sent. Requires ownership of this bot.",
    usage: `say [text]`
}; 