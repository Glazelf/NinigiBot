import Discord from "discord.js";
import getTime from "./getTime.js";
import sendMessage from "./sendMessage.js";
import util from "util";

export default async (exception, client, interaction = null) => {
    // Note: interaction may be a message
    try {
        let timestamp = await getTime(client);
        let exceptionString = exception.toString();
        let errorInspectResult = util.inspect(exception, { depth: 2 });
        if (exceptionString.includes("Missing Access")) {
            return; // Permission error; guild-side mistake
        } else if (exceptionString.includes("Internal Server Error") && !message.author) {
            // If this happens, it's probably a Discord issue. If this return occurs too frequently it might need to be disabled. Also only procs for interactions, not messages. Might want to write a better type check.
            return sendMessage({ client: client, interaction: interaction, content: "An internal server error occurred at Discord. Please check back later to see if Discord has fixed the issue.", ephemeral: true });
        } else if (exceptionString.includes("Unknown interaction")) {
            return; // Expired interaction, can't reply to said interaction
        } else if (exceptionString.includes("ETIMEDOUT") || exceptionString.includes("ECONNREFUSED") || exceptionString.includes("ECONNRESET")) {
            return; // Connection/network errors, not a bot issue for the most part. Might be Discord rate limits involved, especially with ECONNRESET socket hang up errors
        } else if (exceptionString.includes("AxiosError")) {
            return console.log(`${timestamp}: Axios error occurred (likely remote server connection or bad gateway)`);
        } else if (!exceptionString.includes("Missing Permissions")) {
            // Log error
            console.log(`${timestamp}: Error occurred`);
            console.log(exception);
        };
        let user;
        if (interaction) {
            if (interaction.member) user = interaction.author;
            if (interaction.user) user = interaction.user;
        };
        let exceptionCode = Discord.codeBlock(errorInspectResult); // Used to be exception.stack
        let messageContentCode = "";
        if (interaction && interaction.content && interaction.content.length > 0) messageContentCode = Discord.codeBlock(interaction.content);
        let interactionOptions = "\n";
        let subCommand = "";
        if (interaction && interaction.options) {
            subCommand = interaction.options._subcommand; // Using .getSubcommand() fails on user/message commands
            if (interaction.options._hoistedOptions) { // Doesn't seem to be a cleaner way to access all options at once
                interaction.options._hoistedOptions.forEach(option => {
                    interactionOptions += `- \`${option.name}\`: ${option.value}\n`;
                });
            };
        };
        // log to dev channel
        let baseMessage = "";
        baseMessage = interaction && user ? `An error occurred in ${interaction.channel}!
User: **${user.username}** (${user.id})
Message Link: ${interaction.url}
Guild: **${interaction.guild.name}** (${interaction.guild.id})
Channel: **${interaction.channel.name}** (${interaction.channel.id})
Type: ${interaction.type}
Component Type: ${interaction.componentType}
Command: ${interaction.commandName} (${interaction.customId})
Subcommand: ${subCommand}
Options: ${interactionOptions}
Error:\n${exceptionCode}
${messageContentCode}` : `An error occurred:\n${exceptionCode}`;

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1994) + `\`\`\`...`;
        // Fix cross-shard logging sometime
        let devChannel = await client.channels.fetch(client.config.devChannelID);
        if (baseMessage.includes("Missing Permissions")) {
            try {
                return interaction.reply(`I lack permissions to perform the requested action.`);
            } catch (e) {
                return;
            };
        } else {
            return devChannel.send({ content: baseMessage });
        };

    } catch (e) {
        console.log(e);
    };
};