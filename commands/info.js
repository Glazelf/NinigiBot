module.exports.run = async (client, message) => {
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't send you embeds because I don't have permissions to send embedded messages, <@${message.author.id}>.`);

        const Discord = require("discord.js");
        let bot = await client.users.cache.get(client.config.botID);
        // let userCount = await client.users.fetch();
        // let memberFetch = await message.guild.members.fetch();
        // console.log(userCount)
        // console.log(Object.keys(userCount))

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        // Name presence type
        let presenceType = "Playing";
        if (bot.presence.game) {
            switch (bot.presence.game.type) {
                case 0:
                    presenceType = "Playing";
                    break;
                case 1:
                    presenceType = "Streaming";
                    break;
                case 2:
                    presenceType = "Listening to";
                    break;
                case 3:
                    presenceType = "Watching";
                    break;
                default:
                    presenceType = "Playing";
                    break;
            };
        } else {
            presenceType = "Playing";
        };

        // Define presence name
        let presenceName = "";
        if (!bot.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = bot.presence.game;
        };

        // Calculate the uptime in days, hours, minutes, seconds
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        // Figure out if the numbers given is different than 1
        let multiDays = "";
        if (days !== 1) { multiDays = "s" };
        let multiHours = "";
        if (hours !== 1) { multiHours = "s" };
        let multiMinutes = "";
        if (minutes !== 1) { multiMinutes = "s" };
        let multiSeconds = "";
        if (seconds !== 1) { multiSeconds = "s" };

        // Import totals
        let globalVars = require('../events/ready');

        // Reset hours
        while (hours >= 24) {
            hours = hours - 24;
        };

        // Bind variables together into a string
        let uptime = `${hours} hour${multiHours}, ${minutes} minute${multiMinutes} and ${seconds} second${multiSeconds}`;

        // Add day count if there are days
        if (days != 0) {
            uptime = `${days} day${multiDays}, ${uptime}`;
        };

        const profileEmbed = new Discord.MessageEmbed()
            .setColor("#219DCD")
            .setAuthor(client.config.botName, bot.avatarURL())
            .setThumbnail(bot.avatarURL())
            .addField("Full account:", `<@${client.config.botID}>`, true)
            .addField("Owner:", `<@${client.config.ownerID}>`, true)
            .addField("Activity:", `${presenceType} ${presenceName}`, true)
            .addField("Bot ID:", client.config.botID, true)
            .addField("Prefix:", client.config.prefix, true)
            //.addField("Users:", userCount.length, true)
            .addField("Servers:", client.guilds.cache.size, true)
            .addField("Channels:", client.channels.cache.size, true)
            .addField("Messages read:", globalVars.totalMessages, true)
            .addField("Commands used:", globalVars.totalCommands, true)
            .addField("Logs made:", globalVars.totalLogs, true)
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'NinigiBot')", true)
            .addField("Invite:", "[Link](https://discordapp.com/oauth2/authorize?client_id=592760951103684618&scope=bot&permissions=368438486 'Invite Link')", true)
            .addField("Uptime:", `${uptime}.`)
            .addField("Contributors:", `<@${client.config.contributorZoraID}>, <@${client.config.contributorSkinnixID}>, <@${client.config.contributorSkaidusID}>`)
            .addField("Created at:", `${bot.createdAt.toUTCString().substr(0, 16)}, ${checkDays(bot.createdAt)}.`)
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
    name: "Info",
    description: "Returns information about this bot.",
    usage: `info`
};
