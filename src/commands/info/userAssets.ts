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
    let userAssetLinks = [];
    let userAssetEmbeds = [];
    if (user.avatarURL()) userAssetLinks.push(await user.avatarURL(globalVars.displayAvatarSettings));
    if (user.bannerURL()) userAssetLinks.push(await user.bannerURL(globalVars.displayAvatarSettings));
    if (isGuildDataAvailable(interaction) && member) {
        member = await member.fetch({ force: true });
        if (member.avatarURL()) userAssetLinks.push(await member.avatarURL(globalVars.displayAvatarSettings));
        if (member.bannerURL()) userAssetLinks.push(await member.bannerURL(globalVars.displayAvatarSettings));
    };
    // Construct embeds
    for (const link of userAssetLinks) {
        const linkEmbed = new EmbedBuilder()
            .setImage(link)
            .setURL("https://discord.gg"); // Not set to an asset url because images break if URL is null
        userAssetEmbeds.push(linkEmbed);
    };
    if (userAssetEmbeds.length < 1) return sendMessage({ interaction: interaction, content: `${user.username} doesn't have any assets.`, flags: messageFlags.add(MessageFlags.Ephemeral) });
    userAssetEmbeds[0]
        .setColor(globalVars.embedColor as [number, number, number])
        .setAuthor({ name: `${user.username}'s assets:` });
    return sendMessage({ interaction: interaction, embeds: userAssetEmbeds, flags: messageFlags });
};

export const commandObject = new ContextMenuCommandBuilder()
    .setName("User Assets")
    .setType(ApplicationCommandType.User);