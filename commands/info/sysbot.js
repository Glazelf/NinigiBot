module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
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
> ${Konohana} is currently **${KonohanaStatus}** and queue is currently **${queueStatus}**!
> ${Ribbot} is currently **${RibbotStatus}**!
> Check the pins in <#${globalVars.botChannelID}> for more information, including a FAQ and more!`);

    } catch (e) {
        // log error
        let {logger} = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};