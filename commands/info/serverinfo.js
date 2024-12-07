import {
    InteractionContextType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    time,
    TimestampStyles,
    hyperlink
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isAdmin from "../../util/discord/perms/isAdmin.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import languages from "../../objects/discord/languages.json" with { type: "json" };
import verifLevels from "../../objects/discord/verificationLevels.json" with { type: "json" };

const nitroBoostEmojiName = "DiscordNitroBoost";

export default async (interaction, ephemeral) => {
    let adminBool = isAdmin(interaction.member);

    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let guild = interaction.guild;
    await guild.members.fetch();
    await guild.channels.fetch();
    let guildOwner = await guild.fetchOwner();
    let botMembers = guild.members.cache.filter(member => member.user.bot);
    // let humanMemberCount = guild.members.cache.size - botMembers.size;
    let managedEmojis = guild.emojis.cache.filter(emote => emote.managed); // Only managed emote source seems to be Twitch
    let unmanagedEmoteCount = guild.emojis.cache.size - managedEmojis.size;

    // Bans
    let banCount = 0;
    try {
        await guild.bans.fetch();
        banCount = guild.bans.cache.size;
    } catch (e) {
        banCount = 0;
    };
    // Check emote and sticker caps, and boosters
    let emoteMax, stickerMax, boosterString;
    // Variables for the above
    let emoteCapTier0 = 100;
    let emoteCapTier1 = 200;
    let emoteCapTier2 = 300;
    let emoteCapTier3 = 500;
    let stickerCapTier0 = 5;
    let stickerCapTier1 = 15;
    let stickerCapTier2 = 30;
    let stickerCapTier3 = 60;
    let boosterRequirementTier1 = 2;
    let boosterRequirementTier2 = 7;
    let boosterRequirementTier3 = 14;
    if (guild.partnered || guild.verified) {
        emoteMax = emoteCapTier3;
        stickerMax = stickerCapTier3;
        boosterString = guild.premiumSubscriptionCount;
    } else {
        switch (guild.premiumTier) {
            case 1:
                emoteMax = emoteCapTier1;
                stickerMax = stickerCapTier1;
                boosterString = `${guild.premiumSubscriptionCount}/${boosterRequirementTier2}`;
                break;
            case 2:
                emoteMax = emoteCapTier2;
                stickerMax = stickerCapTier2;
                boosterString = `${guild.premiumSubscriptionCount}/${boosterRequirementTier3}`;
                break;
            case 3:
                emoteMax = emoteCapTier3;
                stickerMax = stickerCapTier3;
                boosterString = guild.premiumSubscriptionCount;
                break;
            default:
                emoteMax = emoteCapTier0;
                stickerMax = stickerCapTier0;
                boosterString = `${guild.premiumSubscriptionCount}/${boosterRequirementTier1}`;
        };
    };
    let discordNitroEmoji = interaction.client.application.emojis.cache.find(emoji => emoji.name === nitroBoostEmojiName);
    if (discordNitroEmoji) boosterString += ` ${discordNitroEmoji}`; // Shows up as just ID without explicit string conversion
    // Icon and banner
    let icon = guild.iconURL(globalVars.displayAvatarSettings);
    let banner = null;
    if (guild.bannerURL()) banner = guild.bannerURL(globalVars.displayAvatarSettings);
    // Rules
    let rules = null;
    if (guild.rulesChannel) rules = guild.rulesChannel;
    // Text channels
    let channelCount = 0;
    let threadCount = 0;
    // let archivedThreadCount = 0;
    let serverLinks = "";
    if (guild.features.includes("COMMUNITY")) serverLinks += `<id:guide>\n<id:customize>\n`;
    serverLinks += `<id:browse>\n`;
    if (guild.rulesChannel) serverLinks += `${rules}\n`;
    if (guild.vanityURLCode) serverLinks += `discord.gg/${hyperlink(guild.vanityURLCode, `https://discord.gg/${guild.vanityURLCode}`)}\n`;
    await guild.channels.cache.forEach(async channel => {
        if ([ChannelType.GuildVoice, ChannelType.GuildText].includes(channel.type)) channelCount += 1;
        if (channel.type == ChannelType.GuildThread) threadCount += 1;
        // Get archived threads?
        // if (channel.threads && channel.type == ChannelType.GuildText && botMember.permissions.has(PermissionFlagsBits.Administrator)) {
        //     let archivedThreads = await channel.threads.fetchArchived();
        //     threadCount += archivedThreads.threads.entries().length;
        // };
    });
    let serverButtons = new ActionRowBuilder();
    // Doesn't seem like there's a feature yet for having guild web pages enabled
    let guildwebpage = `https://discord.com/servers/${encodeURIComponent(guild.name.toLowerCase().replace(/ /g, "-"))}-${guild.id}`;
    if (guild.features.includes("DISCOVERABLE")) {
        const webPageButton = new ButtonBuilder()
            .setLabel("Server Web Page")
            .setStyle(ButtonStyle.Link)
            .setURL(guildwebpage);
        serverButtons.addComponents(webPageButton);
    };
    // Doesn't consider canary or ptb
    let serverInsights = `https://discordapp.com/developers/servers/${guild.id}/`;
    if (guild.rulesChannel && (interaction.member.permissions.has(PermissionFlagsBits.ViewGuildInsights) || adminBool)) {
        const insightsButton = new ButtonBuilder()
            .setLabel("Insights")
            .setStyle(ButtonStyle.Link)
            .setURL(serverInsights);
        serverButtons.addComponents(insightsButton);
    };

    let statsString = `Members: ${guild.memberCount}\nBots: ${botMembers.size} 🤖\nChannels: ${channelCount}`;
    // Change "Active Threads" to "Threads" when archived threads get added
    if (threadCount > 0) statsString += `\nActive Threads: ${threadCount}`;
    if (guild.roles.cache.size > 1) statsString += `\nRoles: ${guild.roles.cache.size - 1}`;
    if (banCount > 0) statsString += `\nBans: ${banCount}`;
    if (guild.premiumSubscriptionCount > 0) statsString += `\nBoosts: ${boosterString}`;
    let assetString = `\nEmojis: ${unmanagedEmoteCount}/${emoteMax} 😳`;
    if (managedEmojis.size > 0) assetString += `\nTwitch Emojis: ${managedEmojis.size}`;
    assetString += `\nStickers: ${guild.stickers.cache.size}/${stickerMax}`;

    const serverEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(guild.name)
        .setThumbnail(icon)
        .setFooter({ text: guild.id });
    if (guild.description) serverEmbed.setDescription(guild.description);
    serverEmbed.addFields([
        { name: "Links:", value: serverLinks, inline: false },
        { name: "Stats:", value: statsString, inline: true },
        { name: "Assets:", value: assetString, inline: true },
        { name: "Owner:", value: `${guildOwner} (${guildOwner.user.username})`, inline: true }
    ]);
    if (guild.features.includes('COMMUNITY') && guild.preferredLocale) {
        if (languages[guild.preferredLocale]) serverEmbed.addFields([{ name: "Language:", value: languages[guild.preferredLocale], inline: true }]);
    };
    serverEmbed.addFields([
        { name: "Verification Level:", value: verifLevels[guild.verificationLevel], inline: true },
        { name: "Created:", value: time(Math.floor(guild.createdTimestamp / 1000), TimestampStyles.ShortDateTime), inline: false }
    ]);
    //// Doesn't add much value with 1 shard and autosharding
    // if (interaction.client.options.shardCount) serverEmbed.addFields([{ name: "Ninigi Shard:", value: `${guild.shardId + 1}/${interaction.client.options.shardCount}`, inline: true }]);
    if (banner) serverEmbed.setImage(banner);
    return sendMessage({ interaction: interaction, embeds: serverEmbed, components: serverButtons, ephemeral: ephemeral });
};

// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays info about this server.")
    .setContexts([InteractionContextType.Guild])
    .addBooleanOption(ephemeralOption);