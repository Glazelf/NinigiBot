module.exports = async (exception, client, interaction = null) => {
    // Note: interaction may be a message
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const Discord = require("discord.js");
        const getTime = require('./getTime');
        const sendMessage = require('./sendMessage');
        let timestamp = await getTime(client);

        let exceptionString = exception.toString();
        if (exceptionString.includes("Missing Access")) {
            return; // Permission error; guild-side mistake
        } else if (exceptionString.includes("Internal Server Error")) {
            // If this happens, it's probably a Discord issue. If this return occurs too frequently it might need to be disabled.
            return sendMessage({ client: client, interaction: interaction, content: "An internal server error occurred at Discord. Please check back later to see if Discord has fixed the issue.", ephemeral: true });
        } else if (exceptionString.includes("Unknown interaction")) {
            returnsendMessage({ client: client, interaction: interaction, content: "This interaction has probably expired. The lifetime of most interactions is ~15 minutes.", ephemeral: true });
        } else if (exceptionString.includes("connect ETIMEDOUT")) {
            return;
        } else if (exceptionString.includes("AxiosError")) {
            return console.log(`Axios error occurred (likely remote server connection or bad gateway) at ${timestamp}`);
        } else if (!exceptionString.includes("Missing Permissions")) {
            // Log error
            console.log(`Error at ${timestamp}:`);
            console.log(exception);
        };

        let user;
        if (interaction) {
            if (interaction.member) user = interaction.author;
            if (interaction.user) user = interaction.user;
        };

        let exceptionCode = Discord.Formatters.codeBlock(exception.stack);
        let messageContentCode = "";
        if (interaction && interaction.content && interaction.content.length > 0) messageContentCode = Discord.Formatters.codeBlock(interaction.content);

        // log to dev channel
        let baseMessage = "";
        baseMessage = interaction && user ? `An error occurred in ${interaction.channel}!
User: **${user.tag}** (${user.id})
Message link: ${interaction.url}
Error:\n${exceptionCode}
${messageContentCode}` : `An error occurred:\n${exceptionCode}`;

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1997) + `...`;
        // Fix cross-shard logging sometime
        let devChannel = await client.channels.fetch(client.config.devChannelID);
        if (interaction) {
            if (baseMessage.includes("Missing Permissions")) {
                try {
                    return interaction.reply(`I lack permissions to perform the requested action.`);
                } catch (e) {
                    return;
                };
            } else {
                return devChannel.send({ content: baseMessage });
            };
        };

    } catch (e) {
        console.log(e);
    };
};