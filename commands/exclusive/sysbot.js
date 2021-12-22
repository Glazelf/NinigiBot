exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        // Bot hosts
        let Glaze = await client.users.fetch(client.config.ownerID);
        let Artic = await client.users.fetch("353184551096418316");
        let Mingus = await client.users.fetch("175994984493744129");
        let Phoenix = await client.users.fetch("289213131094229002");
        // let Flare = await client.users.fetch("592353588685307914");
        // let Shion = client.users.fetch("685608164506337351");

        // Bots
        // PKM
        let Konohana = await interaction.guild.members.fetch("696086046685003786", { force: true }); // Glaze
        let Glaceon = await interaction.guild.members.fetch("777555048104067082", { force: true }); // Artic
        let BingoBot = await interaction.guild.members.fetch("898605924057481288", { force: true }); // Mingus
        let PsyBot = await interaction.guild.members.fetch("909111019585028177", { force: true }); // Phoenix
        // let Flar3 = await interaction.guild.members.fetch("734052437811527784", { force: true }); // Flare
        // let Arkos = await interaction.guild.members.fetch("702604221714923691", { force: true }); // Shion
        // ACNH
        let Ribbot = await interaction.guild.members.fetch("739823632267608135", { force: true }); // Glaze
        let TimTomBot = await interaction.guild.members.fetch("898608573943263312", { force: true }); // Mingus
        // let ACFlare = await interaction.guild.members.fetch("792174299716386867", { force: true }); // Flare

        let onlineString = "**Online**";
        let offlineString = "Offline";
        let offlineStatus = offlineString.toLowerCase();
        // PKM
        let KonohanaStatus = onlineString;
        let GlaceonStatus = onlineString;
        let BingoBotStatus = onlineString;
        let PsyBotStatus = onlineString;
        // ACNH
        let RibbotStatus = onlineString;
        let TimTomBotStatus = onlineString;

        if (!Konohana || !Konohana.presence || Konohana.presence.status == offlineStatus) KonohanaStatus = offlineString;
        if (!Glaceon || !Glaceon.presence || Glaceon.presence.status == offlineStatus) GlaceonStatus = offlineString;
        if (!BingoBot || !BingoBot.presence || BingoBot.presence.status == offlineStatus) BingoBotStatus = offlineString;
        if (!PsyBot || !PsyBot.presence || PsyBot.presence.status == offlineStatus) PsyBotStatus = offlineString
        if (!Ribbot || !Ribbot.presence || Ribbot.presence.status == offlineStatus) RibbotStatus = offlineString;
        if (!TimTomBot || !TimTomBot.presence || TimTomBot.presence.status == offlineStatus) TimTomBotStatus = offlineString;

        // Buttons
        let sysbotButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Rules', style: 'LINK', url: `discord://-/channels/${interaction.guild.id}/${interaction.guild.rulesChannel.id}` }))
            .addComponents(new Discord.MessageButton({ label: 'Bot Channel', style: 'LINK', url: `discord://-/channels/${interaction.guild.id}/747878956434325626` }))
            .addComponents(new Discord.MessageButton({ label: 'PKM Bot Channel', style: 'LINK', url: `discord://-/channels/${interaction.guild.id}/797885250667282444` }))
            .addComponents(new Discord.MessageButton({ label: 'ACNH Bot Channel', style: 'LINK', url: `discord://-/channels/${interaction.guild.id}/614979959156375567` }));


        let returnString = `Here's a list of Sysbots and their status:
Format: Bot Name (optional mode) (prefix): status (\`Host#0001\`)
**Pokémon bots:**
${Konohana.nickname || Konohana.user.username} (&): ${KonohanaStatus} (\`${Glaze.tag}\`)
${Glaceon.nickname || Glaceon.user.username} (.): ${GlaceonStatus} (\`${Artic.tag}\`)
${BingoBot.nickname || BingoBot.user.username} (%): ${BingoBotStatus} (\`${Mingus.tag}\`)
${PsyBot.nickname || PsyBot.user.username} (^): ${PsyBotStatus} (\`${Phoenix.tag}\`)
**ACNH bots:**
${Ribbot.nickname || Ribbot.user.username} (;): ${RibbotStatus} (\`${Glaze.tag}\`)
${TimTomBot.nickname || TimTomBot.user.username} (%): ${TimTomBotStatus} (\`${Mingus.tag}\`)

Before asking a question make sure your question isn't already answered in either ${interaction.guild.rulesChannel} or <#${globalVars.botChannelID}>.
**Bots will be hosted when hosts feel like it and have time**, there is no schedule. Asking or even begging for bots is often useless and can be annoying.
Check the pins in <#${globalVars.botChannelID}> for information and ways to support more uptime or donate!`;

        return sendMessage(client, interaction, returnString, null, null, false, sysbotButtons);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "sysbot",
    aliases: ["sb"],
    description: "Sends status of all sysbots.",
    serverID: "549214833858576395"
};
