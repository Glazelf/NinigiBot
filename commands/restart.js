exports.run = (client, message, args) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // send channel a message that you're resetting bot [optional]
        message.channel.send(`> Restarting for <@${message.member.user.id}>...`)
            .then(msg => client.destroy())
            .then(() => client.login(client.config.token));
            
    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`An error occurred using a command in <#${message.channel.id}> by <@${message.member.user.id}> using a command, check console for more information.`);
        // log error
        console.log(e);
        return message.channel.send(`An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
    };
};

module.exports.help = {
    name: "Restart",
    description: "Restarts the entire bot. Requires ownership of this bot.",
    usage: `restart`
}; 