module.exports.run = async (client, message) => {
    try {
        let sysbotID = `696086046685003786`;
        let ACNHbotID = "739823632267608135";
        let Konohana = client.users.cache.get(sysbotID);
        let Ribbot = client.users.cache.get(ACNHbotID);

        let KonohanaStatus = "Offline";
        let queueStatus = "Closed";

        if (message.guild.id !== client.config.botServerID) {
            return;
        };

        switch (Konohana.presence.status) {
            case "online":
                KonohanaStatus = "Online";
                queueStatus = "Open";
                break;
            case "idle":
                KonohanaStatus = "Online";
                queueStatus = "Open";
                break;
            case "dnd":
                KonohanaStatus = "Online";
                break;
        };

        let RibbotStatus = "Offline";

        switch (Ribbot.presence.status) {
            case "online":
                RibbotStatus = "Online";
                break;
            case "idle":
                RibbotStatus = "Online";
                break;
            case "dnd":
                Ribbotstatus = "Online";
                break;
        };

        return message.channel.send(`> Hey, ${message.author}.
> ${Konohana} (Pokémon Bot) is currently **${KonohanaStatus}** and queue is currently **${queueStatus}**!
> ${Ribbot} (ACNH Bot) is currently **${RibbotStatus}**!
> Check the pins in <#${client.config.botChannelID}> for more information, including a FAQ and more!`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};