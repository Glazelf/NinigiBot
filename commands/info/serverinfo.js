const { forEach } = require('lodash');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        let languages = require("../../objects/discord/languages.json");
        let verifLevels = require("../../objects/discord/verificationLevels.json");
        let ShardUtil;

        let guild = message.guild;

        let memberFetch = await guild.members.fetch();
        let humanMembers = memberFetch.filter(member => !member.user.bot).size;
        let botMembers = memberFetch.filter(member => member.user.bot).size;
        let guildsByShard = client.guilds.cache;

        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;
        };

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

        // Check emote and sticker caps
        let emoteMax;
        let stickerMax;
        switch (guild.premiumTier) {
            case "TIER_1":
                emoteMax = 200;
                stickerMax = 15;
                break;
            case "TIER_2":
                emoteMax = 300;
                stickerMax = 30;
                break;
            case "TIER_3":
                emoteMax = 500;
                stickerMax = 60;
                break;
            default:
                emoteMax = 100;
                stickerMax = 0;
        };
        if (guild.partnered) {
            emoteMax = 500;
            stickerMax = 60;
        };

        // Icon and banner
        let icon = guild.iconURL({ format: "png", dynamic: true });
        let banner = null;
        if (guild.bannerURL()) banner = guild.bannerURL({ format: "png" });

        let guildOwner = await guild.fetchOwner();

        // Rules
        if (guild.rulesChannel) {
            var rules = guild.rulesChannel;
            if (guild !== message.guild) rules = `#${guild.rulesChannel.name}`;
        };

        // Text channels
        let channelCount = 0;
        guild.channels.cache.forEach(channel => {
            if (channel.type != "category" && channel.type != "thread") channelCount += 1;
        });

        // Boosters
        let boostGoal;
        if (guild.premiumSubscriptionCount < 2) {
            boostGoal = "/2";
        } else if (guild.premiumSubscriptionCount < 15) {
            boostGoal = "/15";
        } else if (guild.premiumSubscriptionCount < 30) {
            boostGoal = "/30";
        } else {
            boostGoal = "";
        };

        const serverEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${guild.name} (${guild.id})`, icon)
            .setThumbnail(icon);
        if (guild.description) serverEmbed.setDescription(guild.description);
        serverEmbed
            .addField("Owner:", guildOwner.toString(), true);
        if (guild.rulesChannel) serverEmbed.addField("Rules:", rules.toString(), true);
        if (guild.vanityURLCode) serverEmbed.addField("Vanity Invite:", `[discord.gg/${guild.vanityURLCode}](https://discord.gg/${guild.vanityURLCode})`, true);
        if (guild.features.includes('COMMUNITY') && guild.preferredLocale) {
            if (languages[guild.preferredLocale]) serverEmbed.addField("Language:", languages[guild.preferredLocale], true);
        };
        serverEmbed
            .addField("Verification Level:", verifLevels[guild.verificationLevel], true)
            .addField("Total Members:", guild.memberCount.toString(), true)
            .addField("Human Members:", humanMembers.toString(), true)
            .addField("Bots:", `${botMembers} 🤖`, true)
            .addField("Channels:", channelCount.toString(), true);
        if (guild.roles.cache.size > 1) serverEmbed.addField("Roles:", (guild.roles.cache.size - 1).toString(), true);
        if (guild.emojis.cache.size > 0) serverEmbed.addField("Emotes:", `${guild.emojis.cache.size}/${emoteMax} 😳`, true);
        if (guild.stickers.cache.size > 0) serverEmbed.addField("Stickers:", `${guild.stickers.cache.size}/${stickerMax}`, true);
        if (banCount > 0) serverEmbed.addField("Bans:", banCount.toString(), true);
        if (guild.premiumSubscriptionCount > 0) serverEmbed.addField("Nitro Boosts:", `${guild.premiumSubscriptionCount}${boostGoal}${nitroEmote}`, true);
        if (client.shard) serverEmbed.addField("Shard:", `${shardNumber}/${ShardUtil.count}`, true);
        serverEmbed
            .addField("Created:", `${guild.createdAt.toUTCString().substr(5,)}\n${checkDays(guild.createdAt)}`, false);
        if (banner) serverEmbed.setImage(`${banner}?size=256`);
        serverEmbed
            .setFooter(user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, serverEmbed);

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "serverinfo",
    aliases: ["server", "guild", "guildinfo"],
    description: "Sends info about the server.",
};