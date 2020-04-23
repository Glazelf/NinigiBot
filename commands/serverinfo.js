exports.run = (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't send you embeds because I don't have permissions to send embedded messages, <@${message.author.id}>.`);

        const Discord = require("discord.js");

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

        function fetchThings(){
            message.guild.members.fetch();
            message.guild.channels.fetch();
            message.guild.roles.fetch();
        };
        fetchThings();

        const profileEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setThumbnail(message.guild.iconURL())
            .addField("Owner:", `<@${message.guild.owner.user.id}>`, true)
            .addField("Region:", region[message.guild.region], true)
            .addField("Verification Level:", verifLevels[message.guild.verificationLevel], true)
            .addField("ID:", message.guild.id, true)
            .addField("Users:", message.guild.members.cache.filter(member => !member.user.bot).size, true)
            .addField("Bots:", `${message.guild.members.cache.filter(member => member.user.bot).size}`, true)
            .addField("Channels:", message.guild.channels.cache.size, true)
            .addField("Roles:", message.guild.roles.cache.size, true)
            .addField("Created at:", `${message.channel.guild.createdAt.toUTCString().substr(0, 16)}, ${checkDays(message.channel.guild.createdAt)}.`)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Serverinfo",
    description: "Returns info about the server.",
    usage: `serverinfo`
}; 