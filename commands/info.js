module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");
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
        if (client.user.presence.game) {
            switch (client.user.presence.game.type) {
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
        if (!client.user.presence.game) {
            presenceName = "nothing";
        } else {
            presenceName = client.user.presence.game;
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
            .setAuthor(client.user.username, client.user.avatarURL())
            .setThumbnail(client.user.avatarURL())
            .addField("Account:", client.user, true)
            .addField("Owner:", "<@232875725898645504>, Glaze#6669", true)
            .addField("Host:", `<@${globalVars.ownerID}>`, true)
            .addField("Prefix:", globalVars.prefix, true)
            .addField("Servers:", client.guilds.cache.size, true)
            .addField("Channels:", client.channels.cache.size, true)
            .addField("Messages read:", globalVars.totalMessages, true)
            .addField("Commands used:", globalVars.totalCommands, true)
            .addField("Logs made:", globalVars.totalLogs, true)
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'Ninigi Github')", true)
            .addField("Invite:", "[Link](https://discordapp.com/oauth2/authorize?client_id=592760951103684618&scope=bot&permissions=368438486 'Discord Invite')", true)
            .addField("Uptime:", `${uptime}.`)
            .addField("Created at:", `${client.user.createdAt.toUTCString().substr(0, 16)}, ${checkDays(client.user.createdAt)}.`)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        return message.channel.send(profileEmbed);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the client.user owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
