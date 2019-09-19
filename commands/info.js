exports.run = (client, message, args) => {
    return message.channel.send(` > Hello, <@${message.member.user.id}>. ${client.config.botName} was made by ${client.config.ownerName} as a passion project in Javascript! You can DM him at <@${client.config.ownerID}> for more information! 
> Github link: https://github.com/Glazelf/NinigiBot`);
};

module.exports.help = {
    name: "Info",
    description: "Displays some general info about this bot.",
    usage: `info`
};
