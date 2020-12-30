module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        let args = message.content.split(' ');
        let guildID = args[1];
        let guild = client.guilds.cache.get(guildID);
        if (!guild) guild = message.guild;

        let memberFetch = await guild.members.fetch();
        let realMembers = memberFetch.filter(member => !member.user.bot).size;
        let bots = memberFetch.filter(member => member.user.bot).size;
        let onlineMembers = memberFetch.filter(member => !member.user.bot && member.presence.status !== "offline").size;
        let nitroEmote = "<:nitroboost:753268592081895605>";

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

        let icon = null;
        if (guild.iconURL()) icon = guild.iconURL({ format: "png", dynamic: true });

        let ownerTag = guild.owner.user.tag;
        if (guild == message.guild) ownerTag = guild.owner.user;

        if (guild.rulesChannel) {
            var rules = guild.rulesChannel;
            if (guild !== message.guild) rules = `#${guild.rulesChannel.name}`;
        };

        var channelCount = 0;
        guild.channels.cache.forEach(channel => {
            if (channel.type == "voice" || channel.type == "text") channelCount += 1;
        });

        const serverEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`**${guild.name}** (${guild.id})`, icon)
            .setThumbnail(icon)
            .addField("Owner:", ownerTag, true)
            .addField("Region:", region[guild.region], true)
            .addField("Verification Level:", verifLevels[guild.verificationLevel], true);
        if (guild.vanityURLCode) serverEmbed.addField("Vanity Invite:", `discord.gg/${guild.vanityURLCode}`, true);
        if (guild.rulesChannel) serverEmbed.addField("Rules:", rules, true);
        serverEmbed
            .addField("Real members:", realMembers, true)
            .addField("Online members:", onlineMembers, true);
        if (bots > 0) serverEmbed.addField("Bots:", `${bots} 🤖`, true);
        serverEmbed
            .addField("Channels:", channelCount, true);
        if (guild.roles.cache.size > 1) serverEmbed.addField("Roles:", guild.roles.cache.size - 1, true);
        if (guild.emojis.cache.size > 0) serverEmbed.addField("Emotes:", `${guild.emojis.cache.size} 😳`, true);
        if (guild.premiumSubscriptionCount > 0) serverEmbed.addField("Nitro Boosts:", `${guild.premiumSubscriptionCount}${nitroEmote}`, true);
        serverEmbed
            .addField("Created at:", `${guild.createdAt.toUTCString().substr(5,)}
${checkDays(guild.createdAt)}`)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(serverEmbed);

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
    aliases: ["server", "guild", "guildinfo"]
};