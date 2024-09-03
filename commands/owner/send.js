import {
    InteractionContextType,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandStringOption,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    await interaction.deferReply({ ephemeral: ephemeral });
    // Split off command
    let messageContent = interaction.options.getString("content");
    let userIDArg = interaction.options.getString("user-id");
    let channelIDArg = interaction.options.getString("channel-id");
    let attachmentArg = interaction.options.getAttachment("attachment");
    if (!messageContent && !attachmentArg) return sendMessage({ interaction: interaction, content: "Please provide something to send." });
    let attachment = null;
    if (attachmentArg) attachment = attachmentArg.url;
    let target;
    let textMessageBlock = codeBlock("fix", messageContent);
    if (userIDArg || channelIDArg) {
        try {
            if (channelIDArg) target = await interaction.client.channels.fetch(channelIDArg);
            if (userIDArg) target = await interaction.client.users.fetch(userIDArg);
        } catch (e) {
            // console.log(e);
        };
    } else {
        return sendMessage({ interaction: interaction, content: "Please provide a user ID or channel ID." });
    };
    if (!target) return sendMessage({ interaction: interaction, content: "I could not find a user or channel with that ID." });
    let targetFormat = null;
    if (channelIDArg) targetFormat = `**${target.name}** (${target.id}) in **${target.guild.name}** (${target.guild.id})`;
    if (userIDArg) targetFormat = `**${target.username}** (${target.id})`;
    try {
        let messageObject = { content: messageContent };
        if (attachment) messageObject["files"] = [attachment];
        await target.send(messageObject);
        return sendMessage({ interaction: interaction, content: `Message sent to ${targetFormat}:${textMessageBlock}`, files: attachment });
    } catch (e) {
        // console.log(e);
        return sendMessage({ interaction: interaction, content: `Failed to message ${targetFormat}:${textMessageBlock}`, files: attachment });
    };
};

export const guildID = config.devServerID;

// String options
const contentOption = new SlashCommandStringOption()
    .setName("content")
    .setDescription("Message content.")
    .setMaxLength(2000);
const userIDOption = new SlashCommandStringOption()
    .setName("user-id")
    .setDescription("Specify user by ID.")
    .setRequired(true);
const channelIDOption = new SlashCommandStringOption()
    .setName("channel-id")
    .setDescription("Specify channel by ID.")
    .setRequired(true);
// Attachment options
const attachmentOption = new SlashCommandAttachmentOption()
    .setName("attachment")
    .setDescription("Message attachment.");
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const channelSubcommand = new SlashCommandSubcommandBuilder()
    .setName("channel")
    .setDescription("Send to a channel.")
    .addStringOption(channelIDOption)
    .addStringOption(contentOption)
    .addAttachmentOption(attachmentOption)
    .addBooleanOption(ephemeralOption);
const userSubcommand = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("Send to a user.")
    .addStringOption(userIDOption)
    .addStringOption(contentOption)
    .addAttachmentOption(attachmentOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("send")
    .setDescription("Sends a message to a channel or user.")
    .setContexts([InteractionContextType.Guild])
    .addSubcommand(channelSubcommand)
    .addSubcommand(userSubcommand);