exports.run = (client, message, args) => {
    // Split off command
    let textMessage = message.content.slice(5);
    let split = textMessage.split(` `, 1);
    const channelID = split[0];
    let remoteMessage = textMessage.slice(channelID.length + 1);

    // Catch empty argument
    if (textMessage.length < 1) {
        return message.channel.send("> You need to specify text for me to say.")
    };

    // Owner only function to send messages in different channels
    if (message.author.id == client.config.ownerID) {
        try {
            // If channelID is specified correctly, throw message into specified channel
            return message.guild.channels.find("id", channelID).send(remoteMessage);
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
};

module.exports.help = {
    name: "Say",
    description: "Replies with the same message you sent.",
    usage: `say [text]`
}; 