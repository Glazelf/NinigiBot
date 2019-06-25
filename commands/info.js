exports.run = (client, message, args) => {
    message.channel.send(`Hello. ${client.config.botName} was made by ${client.config.ownerName} as a passion project in Javascript! You can DM him at ${client.config.ownerAccount} for more information!`);
};

module.exports.help = {
    name: "Info",
    description: "Displays some general info about this bot.",
    usage: `info`
};
