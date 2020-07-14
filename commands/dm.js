exports.run = (client, message) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        // Split off command
        let textMessage = message.content.slice(4);
        let split = textMessage.split(` `, 1);
        const userID = split[0];
        let remoteMessage = textMessage.slice(userID.length + 1);

        if (remoteMessage.length < 1) {
            return message.channel.send(`> You need to provide a message to send, <@${message.author.id}>.`);
        };

        targetUser = client.users.cache.get(userID);
        if (!targetUser) {
            return message.channel.send(`> I could not find that ID, it's likely I don't share a server with them or they don't exist, <@${message.author.id}>.`);
        };

        targetUser.send(remoteMessage);
        return message.channel.send(`> Message succesfully sent to ${targetUser.tag}, <@${message.author.id}>.`);

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