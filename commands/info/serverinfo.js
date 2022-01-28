exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let languages = require("../../objects/discord/languages.json");
        let verifLevels = require("../../objects/discord/verificationLevels.json");
        let ShardUtil;

        let guild = message.guild;
        await guild.members.fetch();
        await guild.channels.fetch();

        let botMember = await guild.members.fetch(client.user.id);

        let botMembers = guild.members.cache.filter(member => member.user.bot);
        let humanMemberCount = guild.members.cache.size - botMembers.size;
        let managedEmotes = guild.emojis.cache.filter(emote => emote.managed); // Only managed emote source seems to be Twitch
        let unmanagedEmoteCount = guild.emojis.cache.size - managedEmotes.size;
        let guildsByShard = client.guilds.cache;

        let user = message.member.user;

        let nitroEmote = "<:nitro_boost:753268592081895605>";

        // ShardUtil.shardIDForGuildID() doesn't work so instead I wrote this monstrosity to get the shard ID
        var shardNumber = 1;
        if (client.shard) {
            ShardUtil = new Discord.ShardClientUtil(client, "process");
            guildsByShard = await client.shard.fetchClientValues('guilds.cache');
            guildsByShard.forEach(function (guildShard, i) {
                guildShard.forEach(function (shardGuild) {
                    if (shardGuild.id == guild.id) {
                        shardNumber = i + 1;
                    };
                });
            });
        };

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
        let stickerCapTier0 = 0;
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
                case "TIER_1":
                    emoteMax = emoteCapTier1;
                    stickerMax = stickerCapTier1;
                    boosterString = `${guild.premiumSubscriptionCount}/${boosterRequirementTier2}`;
                    break;
                case "TIER_2":
                    emoteMax = emoteCapTier2;
                    stickerMax = stickerCapTier2;
                    boosterString = `${guild.premiumSubscriptionCount}/${boosterRequirementTier3}`;
                    break;
                case "TIER_3":
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
        boosterString = boosterString + nitroEmote;

        // Icon and banner
        let icon = guild.iconURL(globalVars.displayAvatarSettings);
        let banner = null;
        if (guild.bannerURL()) banner = guild.bannerURL(globalVars.displayAvatarSettings);

        let guildOwner = await guild.fetchOwner();

        // Rules
        let rules
        if (guild.rulesChannel) rules = guild.rulesChannel;

        // Text channels
        let channelCount = 0;
        let threadCount = 0;
        let archivedThreadCount = 0;

        await guild.channels.cache.forEach(async channel => {
            if (channel.isText() || channel.isVoice()) channelCount += 1;
            if (channel.isThread()) threadCount += 1;
            // Get archived threads?
            // if (channel.threads && channel.isText() && botMember.permissions.has("ADMINISTRATOR")) {
            //     let archivedThreads = await channel.threads.fetchArchived();
            //     threadCount += archivedThreads.threads.entries().length;
            // };
        });

        const serverEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: `${guild.name} (${guild.id})`, iconURL: icon })
            .setThumbnail(icon);
        if (guild.description) serverEmbed.setDescription(guild.description);
        serverEmbed
            .addField("Owner:", `${guildOwner} (${guildOwner.id})`, false);
        if (guild.rulesChannel) serverEmbed.addField("Rules:", rules.toString(), true);
        if (guild.vanityURLCode) serverEmbed.addField("Vanity Invite:", `[discord.gg/${guild.vanityURLCode}](https://discord.gg/${guild.vanityURLCode})`, true);
        if (guild.features.includes('COMMUNITY') && guild.preferredLocale) {
            if (languages[guild.preferredLocale]) serverEmbed.addField("Language:", languages[guild.preferredLocale], true);
        };
        serverEmbed
            .addField("Verification Level:", verifLevels[guild.verificationLevel], true)
            .addField("Total Members:", guild.memberCount.toString(), true)
            .addField("Human Members:", humanMemberCount.toString(), true)
            .addField("Bots:", `${botMembers.size} 🤖`, true)
            .addField("Channels:", channelCount.toString(), true);
        // Change "Active Threads" to "Threads" when archived threads get added
        if (threadCount > 0) serverEmbed.addField("Active Threads:", threadCount.toString(), true);
        if (guild.roles.cache.size > 1) serverEmbed.addField("Roles:", (guild.roles.cache.size - 1).toString(), true);
        if (unmanagedEmoteCount > 0) serverEmbed.addField("Emotes:", `${unmanagedEmoteCount}/${emoteMax} 😳`, true);
        if (managedEmotes.size > 0) serverEmbed.addField("Twitch Emotes:", `${managedEmotes.size}`, true);
        if (guild.stickers.cache.size > 0) serverEmbed.addField("Stickers:", `${guild.stickers.cache.size}/${stickerMax}`, true);
        if (banCount > 0) serverEmbed.addField("Bans:", banCount.toString(), true);
        if (guild.premiumSubscriptionCount > 0) serverEmbed.addField("Nitro Boosts:", boosterString, true);
        if (client.shard) serverEmbed.addField("Shard:", `${shardNumber}/${ShardUtil.count}`, true);
        serverEmbed
            .addField("Created:", `<t:${Math.floor(guild.createdAt.valueOf() / 1000)}:R>`, true);
        if (banner) serverEmbed.setImage(banner);
        serverEmbed
            .setFooter({ text: user.tag })
            .setTimestamp();

        return sendMessage({ client: client, message: message, embeds: serverEmbed });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "serverinfo",
    aliases: ["server", "guild", "guildinfo"],
    description: "Sends info about the server.",
};