exports.run = (client, message, args, member) => {
    try {
        let PongString = `> Pong!'ed back at <@${message.author.id}> in`;
        return message.channel.send(`${PongString} (hold on, processing latency...)`).then(m => m.edit(`${PongString} ${m.createdTimestamp - message.createdTimestamp}ms, with ${Math.round(client.ping)}ms latency.`) );

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
    name: "Ping",
    description: "Responds with Pong! and the time it took to process this command.",
    usage: `ping`
};
