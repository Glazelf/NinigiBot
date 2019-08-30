exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
        return message.channel.send(client.config.lackPerms)
    }
    var randomDango = client.config.dangoGifs[Math.floor(Math.random() * myArray.length)];
    message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomDango}`);
};

module.exports.help = {
    name: "Dango",
    description: "Responds with a random Dango gif.",
    usage: `dango`
};
