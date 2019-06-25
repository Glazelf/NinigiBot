exports.run = (client, message, args) => {
    message.channel.send(`Hello. ${message.guild.me.name} was made by ${client.config.ownerName} as a passion project in Javascript! You can DM him at ${client.config.ownerAccount} for more information!`);
};

module.exports.help = {
    name: "info",
    description: "Displays some general info about this bot.",
    usage: `info`
};
