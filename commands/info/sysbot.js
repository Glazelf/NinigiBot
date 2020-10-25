module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.guild.id !== client.config.botServerID) {
            return;
        };

        let sysbotID = `696086046685003786`;
        let ACNHbotID = "739823632267608135";
        let Konohana = client.users.cache.get(sysbotID);
        let Ribbot = client.users.cache.get(ACNHbotID);

        let KonohanaStatus = "Online";
        let RibbotStatus = "Online";

        if (Konohana.presence.status == "offline") KonohanaStatus = "Offline";

        if (Ribbot.presence.status == "offline") RibbotStatus = "Offline";

        return message.channel.send(`> Hey, ${message.author}.
> ${Konohana} (Pokémon Bot) is currently **${KonohanaStatus}**!
> ${Ribbot} (ACNH Bot) is currently **${RibbotStatus}**!
> Check the pins in <#${globalVars.botChannelID}> for more information, including a FAQ and more!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: ["sb"]
};