exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(client.config.lackPerms)
    }
    // send channel a message that you're killing bot [optional]
    message.channel.send('Shutting down...')
        .then(msg => client.destroy())
};

module.exports.help = {
    name: "Kill",
    description: "Shuts down the entire bot. Requires ownership of this bot.",
    usage: `kill`
}; 