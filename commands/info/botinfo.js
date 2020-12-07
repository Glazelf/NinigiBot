const { forEach } = require('lodash');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I can't run this command because I don't have permissions to send embedded messages, ${message.author}.`);

        const Discord = require("discord.js");
        // let userCount = await client.users.fetch();
        // let memberFetch = await message.guild.members.fetch();
        // console.log(userCount)
        // console.log(Object.keys(userCount))

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

        // Calculate total user count
        let userCount = await getUsers();

        // Avatar
        let avatar = null;
        if (client.user.avatarURL()) avatar = client.user.avatarURL({ format: "png" });

        // Channels
        var channelCount = 0;
        client.channels.cache.forEach(channel => {
            if (channel.type == "voice" || channel.type == "text") channelCount += 1;
        });

        const profileEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(client.user.username, avatar)
            .setThumbnail(avatar)
            .addField("Account:", client.user, true)
            .addField("Owner:", "Glaze#6669", true)
            .addField("Prefix:", globalVars.prefix, true)
            .addField("Servers:", client.guilds.cache.size, true)
            .addField("Users:", userCount, true)
            .addField("Channels:", channelCount, true);
        if (globalVars.totalMessages > 0) profileEmbed.addField("Messages:", globalVars.totalMessages, true);
        if (globalVars.totalCommands > 0) profileEmbed.addField("Command Uses:", globalVars.totalCommands, true);
        if (globalVars.totalLogs > 0) profileEmbed.addField("Logs:", globalVars.totalLogs, true);
        profileEmbed
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'Ninigi Github')", true)
            .addField("Invite:", "[Link](https://discordapp.com/oauth2/authorize?client_id=592760951103684618&scope=bot&permissions=8 'Bot Invite')", true)
            .addField("Uptime:", `${uptime}.`, false)
            .addField("Created at:", `${client.user.createdAt.toUTCString().substr(0, 16)}, ${checkDays(client.user.createdAt)}.`, false)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(profileEmbed);

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        async function getUsers() {
            // Fast but inaccurate method
            // var userCount = 0;
            // await client.guilds.cache.forEach(guild => {
            //     userCount += guild.memberCount;
            // });

            // Slow but accurate method
            var userList = [];
            await client.guilds.cache.forEach(guild => {
                guild.members.fetch().then(
                    guild.members.cache.forEach(member => {
                        if (!member.user.bot) userList.push(member.id);
                    }));
            });
            userList = userList.filter(uniqueArray);
            let userCount = userList.length;

            return userCount;
        };

        function uniqueArray(value, index, self) {
            return self.indexOf(value) === index;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "botinfo",
    aliases: ["bot", "info"]
};