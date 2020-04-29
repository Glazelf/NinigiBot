exports.run = (client, message) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // send channel a message that you're resetting bot [optional]
        message.channel.send(`> Restarting for <@${message.author.id}>...`)
            .then(msg => client.destroy())
            .then(() => client.login(client.config.token))
            .then(message.channel.send(`> Successfully restarted!`));
        return;

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
}; 