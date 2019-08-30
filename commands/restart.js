exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
        return message.channel.send(client.config.lackPerms)
    }

    // send channel a message that you're resetting bot [optional]
    message.channel.send('Restarting for...')
        .then(msg => client.destroy())
        .then(() => client.login(client.config.token));
};

module.exports.help = {
    name: "Restart",
    description: "Restarts the entire bot. Requires ownership of this bot.",
    usage: `restart`
}; 