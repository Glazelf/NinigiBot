exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID) {
        return message.channel.send(`${client.config.lackPerms}`)
    }
    // Split off unwanted text
    var textMessage = message.content.slice(5);
    // if (message.author.id !== client.config.ownerID) {
        textMessage = `${textMessage} (Message prompted by: ${message.member.user.tag})`
    // }
    message.channel.send(textMessage)
};

module.exports.help = {
    name: "Say",
    description: "Replies with the same message you sent.",
    usage: `say [text]`
}; 