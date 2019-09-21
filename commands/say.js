exports.run = (client, message, args) => {
    try {
        // Split off command
        let textMessage = message.content.slice(5);
        let split = textMessage.split(` `, 1);
        const channelID = split[0];
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // Catch empty argument
        if (textMessage.length < 1) {
            return message.channel.send(`> You need to specify text for me to say, <@${message.member.user.id}>.`)
        };

        // Owner only function to send messages in different channels
        if (message.author.id == client.config.ownerID) {
            try {
                // If channelID is specified correctly, throw message into specified channel
                message.client.channels.find("id", channelID).send(remoteMessage);
                return message.channel.send(`Message succesfully sent to specified channel, <@${message.member.user.id}>.`);
            } catch (e) {
                // If error: execute regular quoteless say
                return message.channel.send(textMessage);
            };
        } else if (message.member.hasPermission("ADMINISTRATOR")) {
            // Return plain message if member is admin
            return message.channel.send(textMessage);
        } else {
            // Add credits to avoid anonymous abuse by people who are admin nor owner
            textMessage = `> "${textMessage}"
    > -<@${message.member.user.id}>`;
            return message.channel.send(textMessage);
        };
        
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
    name: "Say",
    description: "Replies with the same message you sent.",
    usage: `say [text]`
}; 