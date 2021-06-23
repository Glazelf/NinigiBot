module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.guild.id !== client.config.botServerID) return;

        let rulesChannelID = "549220480490536972";

        // Bot hosts
        let Glaze = client.users.cache.get(client.config.ownerID);
        let Flare = client.users.cache.get("592353588685307914");
        let Artic = client.users.cache.get("353184551096418316");
        // let Shion = client.users.cache.get("685608164506337351");
        let Exorcism = client.users.cache.get("465892606417567747");
        // let Xenoseon = "Xenoseon#1604"; // 268790953572040704

        // Bots
        // PKM
        let Konohana = client.users.cache.get(`696086046685003786`);
        let Gura = client.users.cache.get("834359097523830834");
        let Flar3 = client.users.cache.get("734052437811527784");
        let Glaceon = client.users.cache.get("777555048104067082");
        // let BettyBot = client.users.cache.get("790506481630969869");
        // let Arkos = client.users.cache.get("702604221714923691");
        // let Miku = client.users.cache.get("752902915508666499");
        // ACNH
        let Ribbot = client.users.cache.get("739823632267608135");
        let ACFlare = client.users.cache.get("792174299716386867");
        // let MagicDoctor = client.users.cache.get("797553861211586654");

        let onlineString = "**Online**";
        let offlineString = "Offline";
        let offlineStatus = offlineString.toLowerCase();
        let KonohanaStatus = onlineString;
        let GuraStatus = onlineString;
        let Flar3Status = onlineString;
        let GlaceonStatus = onlineString;
        let RibbotStatus = onlineString;
        let ACFlareStatus = onlineString;

        if (Konohana.presence.status == offlineStatus) KonohanaStatus = offlineString;
        if (Gura.presence.status == offlineStatus) GuraStatus = offlineString;
        if (Glaceon.presence.status == offlineStatus) GlaceonStatus = offlineString;
        if (Flar3.presence.status == offlineStatus) Flar3Status = offlineString;
        if (Ribbot.presence.status == offlineStatus) RibbotStatus = offlineString;
        if (ACFlare.presence.status == offlineStatus) ACFlareStatus = offlineString;

        return sendMessage(client, message, `Here's a list of Sysbots and their status:
**Format:** Bot (prefix): status (\`Host#0001\`)
**Pokémon bots:**
${Konohana} (&): ${KonohanaStatus} (\`${Glaze.tag}\`)
${Gura} ($): ${GuraStatus} (\`${Exorcism.tag}\`)
${Flar3} (3): ${Flar3Status} (\`${Flare.tag}\`)
${Glaceon} (.): ${GlaceonStatus} (\`${Artic.tag}\`)
**ACNH bots:**
${Ribbot} (;): ${RibbotStatus} (\`${Glaze.tag}\`)
${ACFlare} (/): ${ACFlareStatus} (\`${Flare.tag}\`)

Before asking a question make sure your question isn't already answered in either <#${rulesChannelID}> or <#${globalVars.botChannelID}>.
Check the pins in <#${globalVars.botChannelID}> for information and ways to support more uptime or donate!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: ["sb"],
    description: "Sends status of all sysbots."
};