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
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: []
};