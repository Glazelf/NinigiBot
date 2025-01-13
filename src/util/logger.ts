import {
    MessageFlags,
    MessageFlagsBitField,
    codeBlock,
    inlineCode
} from "discord.js";
import util from "util";
import getTime from "./getTime.js";
import sendMessage from "./discord/sendMessage.js";
import formatName from "./discord/formatName.js";

export default async ({
    exception,
    client,
    interaction = null
}: any) => {
    // Note: interaction may be a message
    try {
        let messageFlags = new MessageFlagsBitField;
        if (!exception) return;
        let timestamp = getTime();
        let exceptionString = exception.toString();
        let errorInspectResult = util.inspect(exception, { depth: 2 });
        if (!client && interaction) client = interaction.client;
        if (exceptionString.includes("Missing Access")) {
            return; // Permission error; guild-side mistake
        // @ts-expect-error TS(2304): Cannot find name 'message'.
        } else if (exceptionString.includes("Internal Server Error") && !message.author) {
            // If this happens, it's probably a Discord issue. If this return occurs too frequently it might need to be disabled. Also only procs for interactions, not messages. Might want to write a better type check.
            return sendMessage({ interaction: interaction, content: "An internal server error occurred at Discord. Please check back later to see if Discord has fixed the issue.", flags: messageFlags.add(MessageFlags.Ephemeral) });
        } else if (exceptionString.includes("Unknown interaction")) {
            return; // Expired interaction, can't reply to said interaction
        } else if (exceptionString.includes("ETIMEDOUT") || exceptionString.includes("ECONNREFUSED") || exceptionString.includes("ECONNRESET")) {
            return; // Connection/network errors, not a bot issue for the most part. Might be Discord rate limits involved, especially with ECONNRESET socket hang up errors
        } else if (exceptionString.includes("AxiosError") || exceptionString.includes("socket hang up")) {
            // console.log(exception);
            // console.log(`${timestamp}: Axios error occurred (likely remote server connection or bad gateway)`);
            return sendMessage({ interaction: interaction, content: "An error occurred getting a response from the API or it did not respond.\nPlease try again later." });
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
        let exceptionCode = codeBlock("fix", errorInspectResult); // Used to be exception.stack
        let messageContentCode = "";
        if (interaction && interaction.content && interaction.content.length > 0) messageContentCode = codeBlock("fix", interaction.content);
        let interactionOptions = "\n";
        let subCommand = "";
        if (interaction && interaction.options) {
            subCommand = interaction.options._subcommand; // Using .getSubcommand() fails on user/message commands
            if (interaction.options._hoistedOptions) { // Doesn't seem to be a cleaner way to access all options at once
                interaction.options._hoistedOptions.forEach((option: any) => {
                    interactionOptions += `- ${inlineCode(option.name)}: ${option.value}\n`;
                });
            };
        };

        // log to dev channel
        let baseMessage = "";
        baseMessage = interaction && user ? `An error occurred in ${interaction.channel}!
User: ${formatName(user.username)} (${user.id})
Guild: ${formatName(interaction.guild?.name)} (${interaction.guild?.id})
Channel: ${formatName(interaction.channel?.name)} (${interaction.channel?.id})
Message Link: ${interaction.url}
Type: ${interaction.type}
Component Type: ${interaction.componentType}
Command: ${interaction.commandName} (${interaction.customId})
Subcommand: ${subCommand}
Options: ${interactionOptions}
Error:\n${exceptionCode}
${messageContentCode}` : `An error occurred:\n${exceptionCode}`;

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1990) + `...\`\`\``; // Backticks are to make sure codeBlock remains closed after substring
        // Fix cross-shard logging sometime
        let devChannel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
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
