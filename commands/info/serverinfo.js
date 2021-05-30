const { forEach } = require('lodash');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const ShardUtil = new Discord.ShardClientUtil(client, "process");

        let guild = message.guild;

        let memberFetch = await guild.members.fetch();
        let humanMembers = memberFetch.filter(member => !member.user.bot).size;
        let botMembers = memberFetch.filter(member => member.user.bot).size;
        let onlineMembers = memberFetch.filter(member => member.presence.status !== "offline").size;
        let guildsByShard = client.guilds.cache;

        let nitroEmote = "<:nitroboost:753268592081895605>";

        // ShardUtil.shardIDForGuildID() doesn't work so instead I wrote this monstrosity to get the shard ID
        var shardNumber = 1;
        if (client.shard) {
            guildsByShard = await client.shard.fetchClientValues('guilds.cache');
            guildsByShard.forEach(function (guildShard, i) {
                guildShard.forEach(function (shardGuild) {
                    if (shardGuild.id == guild.id) {
                        shardNumber = i + 1;
                    };
                });
            });
        };

        let verifLevels = {
            "NONE": "None",
            "LOW": "Low",
            "MEDIUM": "Medium",
            "HIGH": "(╯°□°）╯︵  ┻━┻",
            "VERY_HIGH": "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"
        };

        let region = {
            "brazil": ":flag_br: Brazil",
            "eu-central": ":flag_eu: Central Europe",
            "singapore": ":flag_sg: Singapore",
            "us-central": ":flag_us: U.S. Central",
            "sydney": ":flag_au: Sydney",
            "us-east": ":flag_us: U.S. East",
            "us-south": ":flag_us: U.S. South",
            "us-west": ":flag_us: U.S. West",
            "eu-west": ":flag_eu: Western Europe",
            "vip-us-east": ":flag_us: VIP U.S. East",
            "london": ":flag_gb: London",
            "amsterdam": ":flag_nl: Amsterdam",
            "hongkong": ":flag_hk: Hong Kong",
            "russia": ":flag_ru: Russia",
            "southafrica": ":flag_za:  South Africa",
            "europe": ":flag_eu: Europe",
            "india": ":flag_in: India"
        };

        // Check emote cap
        let emoteMax = "";
        switch (guild.premiumTier) {
            case 0:
                emoteMax = "100";
                break;
            case 1:
                emoteMax = "200";
                break;
            case 2:
                emoteMax = "300";
                break;
            case 3:
                emoteMax = "500";
                break;
        };
        if (guild.partnered) emoteMax = "500";

        let icon = guild.iconURL({ format: "png", dynamic: true });
        let banner = null;
        if (guild.bannerURL()) banner = guild.bannerURL({ format: "png" });

        let guildOwner = await guild.fetchOwner()

        if (guild.rulesChannel) {
            var rules = guild.rulesChannel;
            if (guild !== message.guild) rules = `#${guild.rulesChannel.name}`;
        };

        let channelCount = 0;
        guild.channels.cache.forEach(channel => {
            if (channel.type != "category") channelCount += 1;
        });

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
            .addField("Owner:", guildOwner, true)
            .addField("Region:", region[guild.region], true)
            .addField("Verification Level:", verifLevels[guild.verificationLevel], true);
        if (guild.vanityURLCode) serverEmbed.addField("Vanity Invite:", `discord.gg/${guild.vanityURLCode}`, true);
        if (guild.rulesChannel) serverEmbed.addField("Rules:", rules, true);
        serverEmbed
            .addField("Total members:", guild.memberCount, true)
            .addField("Human members:", humanMembers, true);
        if (botMembers > 0) serverEmbed.addField("Bots:", `${botMembers} 🤖`, true);
        serverEmbed
            .addField("Channels:", channelCount, true);
        if (guild.roles.cache.size > 1) serverEmbed.addField("Roles:", guild.roles.cache.size - 1, true);
        if (guild.emojis.cache.size > 0) serverEmbed.addField("Emotes:", `${guild.emojis.cache.size}/${emoteMax} 😳`, true);
        if (guild.premiumSubscriptionCount > 0) serverEmbed.addField("Nitro Boosts:", `${guild.premiumSubscriptionCount}${boostGoal}${nitroEmote}`, true);
        if (client.shard) serverEmbed.addField("Shard:", `${shardNumber}/${ShardUtil.count}`, true);
        serverEmbed
            .addField("Created at:", `${guild.createdAt.toUTCString().substr(5,)}
${checkDays(guild.createdAt)}`, false)
            .setImage(`${banner}?size=256`)
            .setFooter(message.member.user.tag)
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