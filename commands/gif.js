exports.run = (client, message, args) => {
    if (message.author.id !== client.config.ownerID && message.author.id !== client.config.subOwnerID) {
        return message.channel.send(client.config.lackPerms)
    }
    var gifArgument = message.content.slice(5);
    if (gifArgument.length < 1) {
        return message.channel.send(`You need to specify a word to use this command, <@${message.member.user.id}>, for usable arguments, use "?gif help".`);
    } else if (gifArgument == "help") {
        return message.channel.send(`Here's a list for all arguments that can return gifs, <@${message.member.user.id}>:
-dango
-shinx`);
    } else if (gifArgument == "dango") {
        var gifsArray = client.config.gifsDango
        var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else if (gifArgument == "shinx") {
        var gifsArray = client.config.gifsShinx
        var randomGif = gifsArray[Math.floor(Math.random() * gifsArray.length)];
        return message.channel.send(`Here's your gif: <@${message.member.user.id}>: ${randomGif}`);
    } else {
        return message.channel.send(`This word has no gifs bound to it, <@${message.member.user.id}>, for usable arguments, use "?gif help", or message Glaze#6669 to request gifs being added.`);
    };
};

module.exports.help = {
    name: "Gif",
    description: "Responds with a random gif of the specified word.",
    usage: `gif [word]`
};
