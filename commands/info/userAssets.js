import {
    MessageFlags,
    EmbedBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isGuildDataAvailable from "../../util/discord/isGuildDataAvailable.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    messageFlags.add(MessageFlags.Ephemeral);
    let user = interaction.options.getUser("user");
    let member = interaction.options.getMember("user");
    user = await user.fetch({ force: true });
    // Get assets
    let avatar = null;
    let banner = null;
    let serverAvatar = null;
    let serverBanner = null;
    let userAssetEmbeds = [];
    if (user.avatarURL()) avatar = await user.avatarURL(globalVars.displayAvatarSettings);
    if (user.bannerURL()) banner = await user.bannerURL(globalVars.displayAvatarSettings);
    if (isGuildDataAvailable(interaction) && member) {
        member = await member.fetch({ force: true });
        if (member.avatarURL()) serverAvatar = await member.avatarURL(globalVars.displayAvatarSettings);
        if (member.bannerURL()) serverBanner = await member.bannerURL(globalVars.displayAvatarSettings);
    };
    if (!avatar && !serverAvatar && !banner && !serverBanner) return sendMessage({ interaction: interaction, content: `${user.username} doesn't have any assets.`, flags: messageFlags.add(MessageFlags.Ephemeral) });

    const userAssetsEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setAuthor({ name: `${user.username}'s assets:` })
        .setURL(avatar);
    userAssetEmbeds.push(userAssetsEmbed);
    if (avatar) {
        const avatarEmbed = new EmbedBuilder()
            .setImage(avatar)
            .setURL(avatar);
        userAssetEmbeds.push(avatarEmbed);
    };
    if (serverAvatar) {
        const serverAvatarEmbed = new EmbedBuilder()
            .setImage(serverAvatar)
            .setURL(avatar);
        userAssetEmbeds.push(serverAvatarEmbed);
    };
    if (banner) {
        const bannerEmbed = new EmbedBuilder()
            .setImage(banner)
            .setURL(avatar);
        userAssetEmbeds.push(bannerEmbed);
    };
    if (serverBanner) {
        const serverBannerEmbed = new EmbedBuilder()
            .setImage(serverBanner)
            .setURL(avatar);
        userAssetEmbeds.push(serverBannerEmbed)
    };
    return sendMessage({ interaction: interaction, embeds: userAssetEmbeds, flags: messageFlags });
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("User Assets")
    .setType(ApplicationCommandType.User);
