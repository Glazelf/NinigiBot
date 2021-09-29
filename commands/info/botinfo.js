const { forEach } = require('lodash');

exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        await client.guilds.fetch();

        const ShardUtil = new Discord.ShardClientUtil(client, "process");
        // let userCount = await client.users.fetch();
        // let memberFetch = await message.guild.members.fetch();
        // console.log(userCount)
        // console.log(Object.keys(userCount))

        var totalGuilds = 0;
        var totalMembers = 0;
        let botVerifRequirement = 76;

        // Get shards (Currently not properly functional)
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
        let averageUsers = Math.round(totalMembers / totalGuilds);
        if (totalGuilds < botVerifRequirement) totalGuilds = `${totalGuilds}/${botVerifRequirement}`;

        // Get unique owner count
        let ownerPool = [];
        await client.guilds.cache.forEach(guild => {
            ownerPool.push(guild.ownerId);
        });
        let uniqueOwners = countUnique(ownerPool);

        let user = message.member.user;

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
        let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

        // Channels
        var channelCount = 0;
        client.channels.cache.forEach(channel => {
            if (channel.isText() || channel.isVoice()) channelCount += 1;
        });

        // Owner
        let owner = client.users.cache.get(client.config.ownerID);

        let botEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(client.user.username, avatar)
            .setThumbnail(avatar)
            .addField("Account:", client.user.toString(), true)
            .addField("Owner:", owner.tag, true)
            .addField("Prefix:", prefix, true);
        if (client.shard) botEmbed.addField("Shards:", ShardUtil.count.toString(), true);
        botEmbed
            .addField("Servers:", totalGuilds.toString(), true)
            .addField("Unique Owners:", uniqueOwners.toString(), true)
            .addField("Total Users:", totalMembers.toString(), true)
            .addField("Average Users:", averageUsers.toString(), true)
            .addField("Channels:", channelCount.toString(), true)
            .addField("Uptime:", uptime, false)
            .addField("Created:", `${client.user.createdAt.toUTCString().substr(5,)}\n${checkDays(client.user.createdAt)}`, false)
            .setFooter(user.tag)
            .setTimestamp();

        // Buttons
        let botButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Invite', style: 'LINK', url: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8` }))
            .addComponents(new Discord.MessageButton({ label: 'Github', style: 'LINK', url: 'https://github.com/Glazelf/NinigiBot' }));

        return sendMessage(client, message, null, botEmbed, null, true, botButtons, true);

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
            // userCount = countUnique(userList);

            return userCount;
        };

        function countUnique(iterable) {
            return new Set(iterable).size;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "botinfo",
    aliases: ["bot", "info"],
    description: `Displays info on this bot.`
};