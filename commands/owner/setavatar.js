import {
    SlashCommandBuilder,
    SlashCommandAttachmentOption
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: interaction.client, interaction: interaction, content: globalVars.lackPermsString });

        ephemeral = true;
        await interaction.deferReply({ ephemeral: ephemeral });

        let avatarArg = interaction.options.getAttachment("avatar");
        let iconImg = avatarArg.url;
        let iconSize = Math.ceil(avatarArg.size / 1000);
        let fileIsImg = false;
        if (avatarArg.contentType.includes('image')) fileIsImg = true;

        if (!fileIsImg) return sendMessage({ client: interaction.client, interaction: interaction, content: `Please supply an image.` });
        try {
            await interaction.clientuser.setAvatar(iconImg);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: interaction.client, interaction: interaction, content: `Failed to update my avatar.` });
        };
        return sendMessage({ client: interaction.client, interaction: interaction, content: `Updated my avatar.` });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

export const guildIDs = [config.devServerID];

// Attachment options
const avatarOption = new SlashCommandAttachmentOption()
    .setName("avatar")
    .setDescription("Image to set the bot's avatar to.")
    .setRequired(true);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("setavatar")
    .setDescription("Set this bot's avatar.")
    .setDMPermission(false)
    .addAttachmentOption(avatarOption);