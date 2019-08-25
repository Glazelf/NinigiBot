exports.run = (client, message, args) => {
    // Split off command
    var textMessage = message.content.slice(5);

    //Catch empty argument
    if (textMessage.length < 1) {
        return message.channel.send("You need to specify text for me to say.")
    }

    //Add credits to avoid anonymous abuse
    if (message.author.id !== client.config.ownerID) {
        textMessage = `${textMessage} 
    -<@${message.member.user.id}>`;
    }
    message.channel.send(textMessage)
};

module.exports.help = {
    name: "Say",
    description: "Replies with the same message you sent.",
    usage: `say [text]`
}; 