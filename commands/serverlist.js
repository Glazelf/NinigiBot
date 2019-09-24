exports.run = (client, message, args) => {
    try {
        let baseMessage = `> This bot is in ${client.guilds.size} servers, <<@${message.author.id}>:`;

        client.guilds.forEach((guild) => {
            baseMessage = `${baseMessage}
> -${guild.name}`
        });

        return message.channel.send(baseMessage);
        
    } catch (e) {
        // send msg to owner
        let members = message.channel.members;
        let owner = members.find('id', client.config.ownerID);
        owner.send(`> An error occurred while <@${message.member.user.id}> tried to use a command in <#${message.channel.id}>, check console for more information.`);
        
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`);
    };
};

module.exports.help = {
    name: "Serverlist",
    description: "Lists all servers the bot is in.",
    usage: `serverlist`
};