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
                queueStatus = "Open";
                break;
            case "idle":
                userStatus = "Online";
                queueStatus = "Open";
                break;
            case "dnd":
                userStatus = "Online";
                break;
        };

        var deadline = new Date("Jun 25, 2020 3:00:00").getTime();
        var now = new Date().getTime();
        var t = deadline - now;
        var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));

        let hourText = "hours";
        if (hours == 1) {
          hourText = "hour";
        };

        let minuteText = "minutes";
        if (minutes == 1) {
          minuteText = "minute";
        };

//         return message.channel.send(`> Hey, <@${message.author.id}>.
// > <@${client.config.sysbotID}> is currently **${userStatus}** and queue is currently **${queueStatus}**! 
// > Check the pins in <#${client.config.botChannelID}> for more information, including a FAQ and more!`);

        return message.channel.send(`> Hey, <@${message.author.id}>.
> <@${client.config.sysbotID}> is currently **Outdated** and needs to be updated to accomodate for the Isle of Armor DLC before it can be used again! 
> Check the pins in <#${client.config.botChannelID}> for more information!
> Estimated: ${hours} ${hourText} and ${minutes} ${minuteText}.`);

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