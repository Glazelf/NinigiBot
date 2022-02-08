const Discord = require("discord.js");
exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        if (message.guild.id !== client.config.botServerID) return;

        // Bot hosts
        let Glaze = await client.users.fetch(client.config.ownerID);
        let Artic = await client.users.fetch("353184551096418316");
        let Phoenix = await client.users.fetch("289213131094229002");
        // let Mingus = await client.users.fetch("175994984493744129");
        // let Flare = await client.users.fetch("592353588685307914");
        // let Shion = client.users.fetch("685608164506337351");

        // Bots
        // PKM
        let Konohana = await message.guild.members.fetch("696086046685003786", { force: true }); // Glaze
        let Glaceon = await message.guild.members.fetch("777555048104067082", { force: true }); // Artic
        let PsyBot = await message.guild.members.fetch("909111019585028177", { force: true }); // Phoenix
        // let BingoBot = await message.guild.members.fetch("898605924057481288", { force: true }); // Mingus
        // let Flar3 = await message.guild.members.fetch("734052437811527784", { force: true }); // Flare
        // let Arkos = await message.guild.members.fetch("702604221714923691", { force: true }); // Shion
        // ACNH
        let Ribbot = await message.guild.members.fetch("739823632267608135", { force: true }); // Glaze
        // let TimTomBot = await message.guild.members.fetch("898608573943263312", { force: true }); // Mingus
        // let ACFlare = await message.guild.members.fetch("792174299716386867", { force: true }); // Flare

        let onlineString = "**Online**";
        let offlineString = "Offline";
        let offlineStatus = offlineString.toLowerCase();
        // PKM
        let KonohanaStatus = onlineString;
        let GlaceonStatus = onlineString;
        let PsyBotStatus = onlineString;
        // ACNH
        let RibbotStatus = onlineString;

        if (!Konohana || !Konohana.presence || Konohana.presence.status == offlineStatus) KonohanaStatus = offlineString;
        if (!Glaceon || !Glaceon.presence || Glaceon.presence.status == offlineStatus) GlaceonStatus = offlineString;
        if (!PsyBot || !PsyBot.presence || PsyBot.presence.status == offlineStatus) PsyBotStatus = offlineString
        if (!Ribbot || !Ribbot.presence || Ribbot.presence.status == offlineStatus) RibbotStatus = offlineString;

        // Buttons
        let sysbotButtons = new Discord.ActionRow()
            .addComponents(new Discord.ButtonComponent({ label: 'Rules', style: Discord.ButtonStyle.Link, url: `discord://-/channels/${message.guild.id}/${message.guild.rulesChannel.id}` }))
            .addComponents(new Discord.ButtonComponent({ label: 'Bot Channel', style: Discord.ButtonStyle.Link, url: `discord://-/channels/${message.guild.id}/747878956434325626` }))
            .addComponents(new Discord.ButtonComponent({ label: 'PKM Bot Channel', style: Discord.ButtonStyle.Link, url: `discord://-/channels/${message.guild.id}/797885250667282444` }))
            .addComponents(new Discord.ButtonComponent({ label: 'ACNH Bot Channel', style: Discord.ButtonStyle.Link, url: `discord://-/channels/${message.guild.id}/614979959156375567` }));


        let returnString = `Here's a list of Sysbots and their status:
Format: Bot Name (optional mode) (prefix): status (\`Host#0001\`)
**Pokémon bots:**
${Konohana.nickname || Konohana.user.username} (&): ${KonohanaStatus} (\`${Glaze.tag}\`)
${Glaceon.nickname || Glaceon.user.username} (.): ${GlaceonStatus} (\`${Artic.tag}\`)
${PsyBot.nickname || PsyBot.user.username} (^): ${PsyBotStatus} (\`${Phoenix.tag}\`)
**ACNH bots:**
${Ribbot.nickname || Ribbot.user.username} (;): ${RibbotStatus} (\`${Glaze.tag}\`)

Before asking a question make sure your question isn't already answered in either ${message.guild.rulesChannel} or <#${globalVars.botChannelID}>.
**Bots will be hosted when hosts feel like it and have time**, there is no schedule. Asking or even begging for bots is often useless and can be annoying.
Check the pins in <#${globalVars.botChannelID}> for information and ways to support more uptime or donate!`;

        return sendMessage({ client: client, message: message, content: returnString, components: sysbotButtons });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: ["sb"],
    description: "Sends status of all sysbots.",
    serverID: "549214833858576395"
};
