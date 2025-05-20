import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandAttachmentOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    await interaction.deferReply({ flags: messageFlags });

    let avatarArg = interaction.options.getAttachment("avatar");
    let iconImg = avatarArg.url;
    let fileIsImg = false;
    if (avatarArg.contentType.includes('image')) fileIsImg = true;

    if (!fileIsImg) return sendMessage({ interaction: interaction, content: `Please supply an image.` });
    try {
        await interaction.client.user.setAvatar(iconImg);
    } catch (e) {
        // console.log(e);
        return sendMessage({ interaction: interaction, content: `Failed to update my avatar.` });
    };
    return sendMessage({ interaction: interaction, content: `Updated my avatar.` });
};

export const guildID = process.env.DEV_SERVER_ID;

// Attachment options
const avatarOption = new SlashCommandAttachmentOption()
    .setName("avatar")
    .setDescription("Image to set the bot's avatar to.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("setavatar")
    .setDescription("Set this bot's avatar.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addAttachmentOption(avatarOption);