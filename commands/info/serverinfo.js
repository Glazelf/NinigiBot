module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");

        args = message.content.split(' ');
        let guildID = args[1];
        let guild = client.guilds.cache.get(guildID);
        if (!guild) guild = message.guild;

        let memberFetch = await guild.members.fetch();
        let realMembers = memberFetch.filter(member => !member.user.bot).size;
        let bots = memberFetch.filter(member => member.user.bot).size;
        let onlineMembers = memberFetch.filter(member => !member.user.bot && member.presence.status !== "offline").size;
        let nitroEmote = "<:nitroboost:753268592081895605>";

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
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

        let icon = null;
        if (guild.iconURL()) icon = guild.iconURL({ format: "png", dynamic: true });

        let ownerTag = guild.owner.user.tag;
        if (guild == message.guild) ownerTag = guild.owner.user;

        const serverEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(guild.name, icon)
            .setThumbnail(icon)
            .addField("Owner:", ownerTag, true)
            .addField("Region:", region[guild.region], true)
            .addField("Verification Level:", verifLevels[guild.verificationLevel], true)
            .addField("ID:", guild.id, true)
            .addField("Members:", realMembers, true)
            .addField("Online members:", onlineMembers, true)
            .addField("Bots:", `${bots} 🤖`, true)
            .addField("Channels:", guild.channels.cache.size, true)
            .addField("Roles:", guild.roles.cache.size, true)
            .addField("Emotes:", `${guild.emojis.cache.size} 😳`, true);
        if (guild.premiumSubscriptionCount > 0) serverEmbed.addField("Nitro Boosts:", `${guild.premiumSubscriptionCount}${nitroEmote}`, true);
        serverEmbed
            .addField("Created at:", `${guild.createdAt.toUTCString().substr(0, 16)}, ${checkDays(guild.createdAt)}.`)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(serverEmbed);

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