const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let languages = require("../../objects/discord/languages.json");
        let verifLevels = require("../../objects/discord/verificationLevels.json");

        let adminBool = isAdmin(client, interaction.member);
        let adminBot = isAdmin(client, interaction.guild.members.me);

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let guild = interaction.guild;
        await guild.members.fetch();
        await guild.channels.fetch();
        let guildOwner = await guild.fetchOwner();
        let botMembers = guild.members.cache.filter(member => member.user.bot);
        // let humanMemberCount = guild.members.cache.size - botMembers.size;
        let managedEmotes = guild.emojis.cache.filter(emote => emote.managed); // Only managed emote source seems to be Twitch
        let unmanagedEmoteCount = guild.emojis.cache.size - managedEmotes.size;

        let nitroEmote = "<:nitro_boost:753268592081895605>";
        // Bans
        let banCount = 0;
        try {
            await guild.bans.fetch();
            banCount = guild.bans.cache.size;
        } catch (e) {
            banCount = 0;
        };
        // Check emote and sticker caps, and boosters
        let emoteMax;
        let stickerMax;
        let boosterString;
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
        if (guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) || adminBot) boosterString = boosterString + nitroEmote;
        // Icon and banner
        let icon = guild.iconURL(client.globalVars.displayAvatarSettings);
        let banner = null;
        if (guild.bannerURL()) banner = guild.bannerURL(client.globalVars.displayAvatarSettings);
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
        if (guild.vanityURLCode) serverLinks += `discord.gg/[${guild.vanityURLCode}](https://discord.gg/${guild.vanityURLCode})\n`;
        await guild.channels.cache.forEach(async channel => {
            if ([Discord.ChannelType.GuildVoice, Discord.ChannelType.GuildText].includes(channel.type)) channelCount += 1;
            if (channel.type == Discord.ChannelType.GuildThread) threadCount += 1;
            // Get archived threads?
            // if (channel.threads && channel.type == Discord.ChannelType.GuildText && botMember.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            //     let archivedThreads = await channel.threads.fetchArchived();
            //     threadCount += archivedThreads.threads.entries().length;
            // };
        });
        let serverButtons = new Discord.ActionRowBuilder();
        // Doesn't seem like there's a feature yet for having guild web pages enabled
        let guildwebpage = `https://discord.com/servers/${encodeURIComponent(guild.name.toLowerCase().replaceAll(" ", "-"))}-${guild.id}`;
        if (guild.features.includes("DISCOVERABLE")) serverButtons.addComponents(new Discord.ButtonBuilder({ label: 'Server Web Page', style: Discord.ButtonStyle.Link, url: guildwebpage }));
        // Doesn't consider canary or ptb
        let serverInsights = `https://discordapp.com/developers/servers/${guild.id}/`;
        if (guild.rulesChannel && (interaction.member.permissions.has(Discord.PermissionFlagsBits.ViewGuildInsights) || adminBool)) serverButtons.addComponents(new Discord.ButtonBuilder({ label: 'Insights', style: Discord.ButtonStyle.Link, url: serverInsights }));

        let statsString = `Members: ${guild.memberCount}\nBots: ${botMembers.size}🤖\nChannels: ${channelCount}`;
        // Change "Active Threads" to "Threads" when archived threads get added
        if (threadCount > 0) statsString += `\nActive Threads: ${threadCount}`;
        if (guild.roles.cache.size > 1) statsString += `\nRoles: ${guild.roles.cache.size - 1}`;
        if (banCount > 0) statsString += `\nBans: ${banCount}`;
        if (guild.premiumSubscriptionCount > 0) statsString += `\nNitro Boosters: ${boosterString}`;
        let assetString = `\nEmotes: ${unmanagedEmoteCount}/${emoteMax} 😳`;
        if (managedEmotes.size > 0) assetString += `\nTwitch Emotes: ${managedEmotes.size}`;
        assetString += `\nStickers: ${guild.stickers.cache.size}/${stickerMax}`;

        const serverEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor)
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
            { name: "Created:", value: `<t:${Math.floor(guild.createdAt.valueOf() / 1000)}:f>`, inline: false }
        ]);
        //// Doesn't add much value with 1 shard and autosharding
        // if (client.options.shardCount) serverEmbed.addFields([{ name: "Ninigi Shard:", value: `${guild.shardId + 1}/${client.options.shardCount}`, inline: true }]);
        if (banner) serverEmbed.setImage(banner);
        return sendMessage({ client: client, interaction: interaction, embeds: serverEmbed, components: serverButtons, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "serverinfo",
    description: "Displays info about the server.",
    options: [{
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};