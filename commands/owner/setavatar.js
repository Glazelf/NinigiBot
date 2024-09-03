import {
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandAttachmentOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    ephemeral = true;
    await interaction.deferReply({ ephemeral: ephemeral });

    let avatarArg = interaction.options.getAttachment("avatar");
    let iconImg = avatarArg.url;
    let iconSize = Math.ceil(avatarArg.size / 1000);
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

export const guildID = config.devServerID;

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
    .addAttachmentOption(avatarOption);