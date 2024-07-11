import {
    EmbedBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction) => {
    let user = interaction.options.getUser("user");
    let member = interaction.options.getMember("user");
    // Get avatars
    let avatar = null;
    let serverAvatar = null;
    if (user.avatarURL()) avatar = await user.avatarURL(globalVars.displayAvatarSettings);
    if (member && member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
    if (!avatar && !serverAvatar) return sendMessage({ interaction: interaction, content: `${user.username} doesn't have an avatar.` });
    if (!serverAvatar) {
        serverAvatar = avatar;
        avatar = null;
    };
    const avatarEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setThumbnail(avatar)
        .setTitle(`${user.username}'s avatar(s):`)
        .setImage(serverAvatar);
    return sendMessage({ interaction: interaction, embeds: avatarEmbed });
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("Avatar")
    .setType(ApplicationCommandType.User);