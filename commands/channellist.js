exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
        return message.channel.send(client.config.lackPerms)
    };

    let baseMessage = `This bot can see ${client.channels.size} channels, <@${message.member.user.id}>:`;

    client.channels.forEach((channel) => {
        baseMessage = `${baseMessage}
-${channel.name}`
    });

    return message.channel.send(baseMessage);
};

module.exports.help = {
    name: "Channellist",
    description: "Lists all channels the bot can see",
    usage: `serverlist`
};