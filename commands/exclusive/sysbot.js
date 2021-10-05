exports.run = async (client, message, args = [], language) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        if (message.guild.id !== client.config.botServerID) return;
        const Discord = require("discord.js");

        if (message.guild.id !== client.config.botServerID) return;

        // Bot hosts
        let Glaze = await client.users.fetch(client.config.ownerID);
        let Flare = await client.users.fetch("592353588685307914");
        let Artic = await client.users.fetch("353184551096418316");
        // let Shion = client.users.fetch("685608164506337351");
        // let Xenoseon = "Xenoseon#1604"; // 268790953572040704

        // Bots
        // PKM
        let Konohana = await message.guild.members.fetch("696086046685003786");
        let Flar3 = await message.guild.members.fetch("734052437811527784");
        let Glaceon = await message.guild.members.fetch("777555048104067082");
        // let BettyBot = await message.guild.members.fetch("790506481630969869");
        // let Arkos = await message.guild.members.fetch("702604221714923691");
        // let Miku = await message.guild.members.fetch("752902915508666499");
        // ACNH
        let Ribbot = await message.guild.members.fetch("739823632267608135");
        let ACFlare = await message.guild.members.fetch("792174299716386867");
        // let MagicDoctor = await message.guild.members.fetch("797553861211586654");

        let onlineString = "**Online**";
        let offlineString = "Offline";
        let offlineStatus = offlineString.toLowerCase();
        let KonohanaStatus = onlineString;
        let GuraStatus = onlineString;
        let Flar3Status = onlineString;
        let GlaceonStatus = onlineString;
        let RibbotStatus = onlineString;
        let ACFlareStatus = onlineString;

        if (!Konohana || !Konohana.presence || Konohana.presence.status == offlineStatus) KonohanaStatus = offlineString;
        if (!Glaceon || !Glaceon.presence || Glaceon.presence.status == offlineStatus) GlaceonStatus = offlineString;
        if (!Flar3 || !Flar3.presence || Flar3.presence.status == offlineStatus) Flar3Status = offlineString;
        if (!Ribbot || !Ribbot.presence || Ribbot.presence.status == offlineStatus) RibbotStatus = offlineString;
        if (!ACFlare || !ACFlare.presence || ACFlare.presence.status == offlineStatus) ACFlareStatus = offlineString;

        // Buttons
        let sysbotButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Rules', style: 'LINK', url: `discord://-/channels/${message.guild.id}/${message.guild.rulesChannel.id}` }))
            .addComponents(new Discord.MessageButton({ label: 'Bot Channel', style: 'LINK', url: `discord://-/channels/${message.guild.id}/747878956434325626` }))
            .addComponents(new Discord.MessageButton({ label: 'PKM Bot Channel', style: 'LINK', url: `discord://-/channels/${message.guild.id}/797885250667282444` }))
            .addComponents(new Discord.MessageButton({ label: 'ACNH Bot Channel', style: 'LINK', url: `discord://-/channels/${message.guild.id}/614979959156375567` }));


        let returnString = `Here's a list of Sysbots and their status:
**Format:** Bot (prefix): status (\`Host#0001\`) (Notes)
**Pokémon bots:**
${Konohana} (&): ${KonohanaStatus} (\`${Glaze.tag}\`)
${Flar3} (3): ${Flar3Status} (\`${Flare.tag}\`)
${Glaceon} (.): ${GlaceonStatus} (\`${Artic.tag}\`)
**ACNH bots:**
${Ribbot} (;): ${RibbotStatus} (\`${Glaze.tag}\`)
${ACFlare} (/): ${ACFlareStatus} (\`${Flare.tag}\`)

Before asking a question make sure your question isn't already answered in either ${message.guild.rulesChannel} or <#${globalVars.botChannelID}>.
Check the pins in <#${globalVars.botChannelID}> for information and ways to support more uptime or donate!`;

        return sendMessage(client, message, returnString, null, null, false, sysbotButtons);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: ["sb"],
    description: "Sends status of all sysbots."
};
