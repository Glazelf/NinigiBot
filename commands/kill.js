exports.run = (client, message, args) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // send channel a message that you're killing bot [optional]
        message.channel.send('> Shutting down...')
            .then(msg => client.destroy());

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);
        // log error
        console.log(e);
        return message.channel.send(`> An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
    };
};

module.exports.help = {
    name: "Kill",
    description: "Shuts down the entire bot. Requires ownership of this bot.",
    usage: `kill`
};