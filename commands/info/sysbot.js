module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.guild.id !== client.config.botServerID) {
            return;
        };

        // Bot hosts
        let Glaze = client.users.cache.get(client.config.ownerID);
        let Flare = client.users.cache.get("592353588685307914");
        let Shion = client.users.cache.get("685608164506337351");

        // Bots
        // PKM
        let Konohana = client.users.cache.get(`696086046685003786`);
        let Flar3 = client.users.cache.get("734052437811527784");
        let Arkos = client.users.cache.get("702604221714923691");
        // ACNH
        let Ribbot = client.users.cache.get("739823632267608135");

        let KonohanaStatus = "Online";
        let Flar3Status = "Online";
        let RibbotStatus = "Online";

        if (Konohana.presence.status = "offline") KonohanaStatus = "Offline";
        if (Flar3.presence.status = "offline") Flar3Status = "Offline";
        if (Ribbot.presence.status = "offline") RibbotStatus = "Offline";

        return message.channel.send(`> Hey, ${message.author}, here's a list of Sysbots and their status:
> **Format:** Bot (prefix): status (Host#0001)
> **Pokémon bots:**
> ${Konohana} (!): **${KonohanaStatus}** (${Glaze.tag})
> ${Flar3} (3): **${Flar3Status}** (${Flare.tag})
> **ACNH bots:**
> ${Ribbot} (!): **${RibbotStatus}** (${Glaze.tag})
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