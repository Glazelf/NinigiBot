exports.run = (client, message, args) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // send channel a message that you're killing bot [optional]
        message.channel.send(`> Shutting down for <@${message.author.id}>...`)
            .then(msg => client.destroy());

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);

        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};