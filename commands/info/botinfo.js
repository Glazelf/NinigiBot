const { forEach } = require('lodash');

module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        const Discord = require("discord.js");
        const ShardUtil = new Discord.ShardClientUtil(client, "process");
        // let userCount = await client.users.fetch();
        // let memberFetch = await message.guild.members.fetch();
        // console.log(userCount)
        // console.log(Object.keys(userCount))

        var totalGuilds = 0;
        var totalMembers = 0;

        if (client.shard) {
            const promises = [
                client.shard.fetchClientValues('guilds.cache.size'),
                client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)')
            ];

            await Promise.all(promises)
                .then(results => {
                    totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                    totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
                })
                .catch(console.error);
        } else {
            totalGuilds = client.guilds.cache.size;
            totalMembers = await getUsers();
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

        // Calculate total user count
        // let userCount = await getUsers();

        // Avatar
        let avatar = client.user.displayAvatarURL({ format: "png", dynamic: true });

        // Channels
        var channelCount = 0;
        client.channels.cache.forEach(channel => {
            if (channel.type != "category") channelCount += 1;
        });

        const botEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(client.user.username, avatar)
            .setThumbnail(avatar)
            .addField("Account:", client.user, true)
            .addField("Owner:", "Glaze#6669", true)
            .addField("Prefix:", prefix, true);
        if (client.shard) botEmbed.addField("Shards:", ShardUtil.count, true);
        botEmbed
            .addField("Servers:", totalGuilds, true)
            .addField("Users:", totalMembers, true)
            .addField("Channels:", channelCount, true)
            .addField("Code:", "[Github](https://github.com/Glazelf/NinigiBot 'Ninigi Github')", true)
            .addField("Bot Invite:", `[Invite](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8 'Bot Invite')`, true)
            .addField("Uptime:", uptime, false)
            .addField("Created at:", `${client.user.createdAt.toUTCString().substr(5,)}
${checkDays(client.user.createdAt)}`, false)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.channel.send(botEmbed);

        function checkDays(date) {
            let now = new Date();
            let diff = now.getTime() - date.getTime();
            let days = Math.floor(diff / 86400000);
            return days + (days == 1 ? " day" : " days") + " ago";
        };

        async function getUsers() {
            // Fast but inaccurate method
            var userCount = 0;
            await client.guilds.cache.forEach(guild => {
                userCount += guild.memberCount;
            });

            // Slow but accurate method
            // var userList = [];
            // await client.guilds.cache.forEach(guild => {
            //     guild.members.fetch().then(
            //         guild.members.cache.forEach(member => {
            //             if (!member.user.bot) userList.push(member.id);
            //         }));
            // });
            // userList = userList.filter(uniqueArray);
            // let userCount = userList.length;

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