exports.run = (client, message, args) => {
    try {
        return message.channel.send(` > Hello, <@${message.author.id}>. ${client.config.botName} was made by ${client.config.ownerName} as a passion project in Javascript! You can DM him at <@${client.config.ownerID}> for more information! 
> Github link: https://github.com/Glazelf/NinigiBot`);

    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);
        
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, <@${message.author.id}>, please use "${client.config.prefix}report" to report the issue.`);
    };
};

module.exports.help = {
    name: "Info",
    description: "Displays some general info about this bot.",
    usage: `info`
};
