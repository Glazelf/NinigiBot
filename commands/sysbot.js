module.exports.run = async (client, message) => {
    try {
        if (message.guild.id !== client.config.botServerID) {
            return;
        };

        let userCache = client.users.cache.get(client.config.sysbotID);

        let userStatus = "Offline";
        let queueStatus = "Closed";

        switch (userCache.presence.status) {
            case "online":
                userStatus = "Online";
                queueStatus = "either Open (and empty!) or Closed";
                break;
            case "idle":
                userStatus = "Online";
                queueStatus = "Open";
                break;
            case "dnd":
                userStatus = "Online";
                break;
        };

        return message.channel.send(`> Hey, <@${message.author.id}>.
> <@${client.config.sysbotID}> is currently **${userStatus}** and queue is currently **${queueStatus}**! 
> Check the pins in <#${client.config.botChannelID}> for more information, including a FAQ and more!`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};