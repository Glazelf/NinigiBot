module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");
        let memberFetch = await message.guild.members.fetch();
        const input = message.content.split(` `, 2);
        let realMembers = memberFetch.filter(member => !member.user.bot).size;
        let bots = memberFetch.filter(member => member.user.bot).size;
        let onlineMembers = memberFetch.filter(member => !member.user.bot && member.presence.status !== "offline").size;

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
        if (message.guild.iconURL()) icon = message.guild.iconURL({ format: "png", dynamic: true });

        const serverEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(message.guild.name, icon)
            .setThumbnail(icon)
            .addField("Owner:", message.guild.owner.user, true)
            .addField("Region:", region[message.guild.region], true)
            .addField("Verification Level:", verifLevels[message.guild.verificationLevel], true)
            .addField("ID:", message.guild.id, true)
            .addField("Users:", realMembers, true)
            .addField("Online users:", onlineMembers, true)
            .addField("Bots:", bots, true)
            .addField("Channels:", message.guild.channels.cache.size, true)
            .addField("Roles:", message.guild.roles.cache.size, true)
            .addField("Created at:", `${message.channel.guild.createdAt.toUTCString().substr(0, 16)}, ${checkDays(message.channel.guild.createdAt)}.`)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(serverEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};