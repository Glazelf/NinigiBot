exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
        return message.channel.send(client.config.lackPerms)
    }
    var gifArgument = message.content.slice(5);
    if (gifArgument == "dango") {
        var randomDango = client.config.gifsDango[Math.floor(Math.random() * client.config.gifsDango.length)];
        message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomDango}`);
    };
    if (gifArgument == "shinx") {
        var randomShinx = client.config.gifsShinx[Math.floor(Math.random() * client.config.gifsShinx.length)];
    };
};

module.exports.help = {
    name: "Dango",
    description: "Responds with a random Dango gif.",
    usage: `dango`
};
