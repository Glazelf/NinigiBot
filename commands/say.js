exports.run = (client, message, args) => {
    // Split off command
    let textMessage = message.content.slice(5);

    // Catch empty argument
    if (textMessage.length < 1) {
        return message.channel.send("> You need to specify text for me to say.")
    };

    // Owner only function to send messages in different channels
    if (message.author.id == client.config.ownerID && message.member.hasPermission("ADMINISTRATOR")) {
        let split = textMessage.split(` `, 1);
        const channelID = split[0];
        let remoteMessage = textMessage.slice(channelID.length + 1);

        // If channel ID is missing, do old function
        if(channelID == NaN || channelID == undefined || channelID == null) {
            return message.channel.send(textMessage);
        };

        return message.guild.channels.find(channel => channel.id === channelID).send(remoteMessage);
    };

    // Add credits to avoid anonymous abuse by people who are admin nor owner
    if (!message.member.hasPermission("ADMINISTRATOR") && message.author.id !== client.config.ownerID) {
        textMessage = `> "${textMessage}"
> -<@${message.member.user.id}>`;
        return message.channel.send(textMessage);
    };

    // Return plain message if member is only either admin or owner
    if(message.member.hasPermission("ADMINISTRATOR") || message.author.id == client.config.ownerID){
        return message.channel.send(textMessage);
    };
};

module.exports.help = {
    name: "Say",
    description: "Replies with the same message you sent.",
    usage: `say [text]`
}; 