module.exports.run = async (client, message) => {
    try {
        let SysbotID = "696086046685003786";
        let userCache = client.users.cache.get(SysbotID);

        let userStatus = "Error?";
        switch (userCache.presence.status) {
            case "online":
                userStatus = "Online";
                break;
            case "idle":
                userStatus = "Onling for trading";
                break;
            case "dnd":
                userStatus = "Online but not accepting trades";
                break;
            case "invisible":
                userStatus = "Offline";
                break;
            case "offline":
                userStatus = "Offline";
                break;
            default:
                userStatus = "Error?";
                break;
        };

            return message.channel.send(`> <@${SysbotID}> is currently: ${userStatus}! 
> Check the pins in <#${client.config.botChannelID}> for more information on how to use it, a FAQ and more!`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Sysbot",
    description: `Responds with a status update on <@696086046685003786>.`,
    usage: `sysbot`
};