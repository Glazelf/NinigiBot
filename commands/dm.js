exports.run = (client, message) => {
    try {
        // Split off command
        let textMessage = message.content.slice(4);
        let split = textMessage.split(` `, 1);
        const userID = split[0];
        let remoteMessage = textMessage.slice(userID.length + 1);

        client.users.get(userID).send(remoteMessage);
        return message.channel.send(`> Message succesfully sent to specified user, <@${message.author.id}>.`);

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