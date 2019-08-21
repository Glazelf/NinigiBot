exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(client.config.lackPerms)
    }
    // send channel a message that you're resetting bot [optional]
    message.channel.send('Resetting...')
        .then(msg => client.destroy())
        .then(() => client.login(client.config.token))
        .then(message.channel.send('Successfully restarted!'))
};

module.exports.help = {
    name: "Restart",
    description: "Restarts the entire bot. Requires ownership of this bot.",
    usage: `restart`
}; 