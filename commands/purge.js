exports.run = (client, message, args) => {
    message.delete(1000); //Supposed to delete message
    message.channel.send(message.content.slice(5, message.content.length));
};

module.exports.help = {
    name: "Purge",
    description: "Deletes the specified amount of messages.",
    usage: `purge [number]`
};
