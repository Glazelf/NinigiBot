exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const axios = require("axios");

        let DiscordJSVersion = Discord.version;
        if (DiscordJSVersion.includes("dev")) DiscordJSVersion = DiscordJSVersion.split("dev")[0] + "dev";
        let memoryUsage = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100}MB`;

        await client.guilds.fetch();

        const ShardUtil = new Discord.ShardClientUtil(client, "process");
        // let userCount = await client.users.fetch();
        // let memberFetch = await interaction.guild.members.fetch();
        // console.log(userCount);
        // console.log(Object.keys(userCount));

        let totalGuilds = 0;
        let totalMembers = 0;

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

        // Get unique owner count
        let ownerPool = [];
        await client.guilds.cache.forEach(guild => {
            ownerPool.push(guild.ownerId);
        });
        let uniqueOwners = countUnique(ownerPool);

        // Get latest commit
        let githubURLVars = "Glazelf/NinigiBot";
        let githubResponse = null
        try {
            githubResponse = await axios.get(`https://api.github.com/repos/${githubURLVars}/branches/master`);
        } catch (e) {
            // console.log(e);
            githubResponse = null;
        };

        // Timestamps are divided by 1000 to convert from milliseconds (unix) to seconds (Disord timestamps)
        let createdAt = Math.floor(client.user.createdAt.valueOf() / 1000);
        let date = Date.now();
        let onlineSince = Math.floor((date - client.uptime) / 1000);
        let lastCommit = Math.floor(new Date(githubResponse.data.commit.commit.author.date).getTime() / 1000);

        // Calculate total user count
        // let userCount = await getUsers();

        // Avatar
        let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);

        // Owner
        let owner = "Glaze#6669 (232875725898645504)";

        let botEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: client.user.username, iconURL: avatar })
            .setThumbnail(avatar)
            .addField("Author:", owner, false)
            .addField("Discord.JS:", DiscordJSVersion, true)
            .addField("Memory Usage:", memoryUsage, true)
        if (client.shard) botEmbed.addField("Shards:", ShardUtil.count.toString(), true);
        botEmbed
            .addField("Servers:", totalGuilds.toString(), true)
            .addField("Unique Owners:", uniqueOwners.toString(), true)
            .addField("Total Users:", totalMembers.toString(), true)
            .addField("Average Users:", averageUsers.toString(), true)
            .addField("Created:", `<t:${createdAt}:R>`, true);
        if (githubResponse) botEmbed.addField("Latest Commit:", `<t:${lastCommit}:R>`, true);
        botEmbed
            .addField("Online Since:", `<t:${onlineSince}:R>`, true)
            .setFooter({ text: interaction.user.tag })
            .setTimestamp();

        // Buttons
        let botButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Invite', style: 'LINK', url: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8` }))
            .addComponents(new Discord.MessageButton({ label: 'Github', style: 'LINK', url: `https://github.com/${githubURLVars}` }));

        return sendMessage({ client: client, interaction: interaction, embeds: botEmbed, components: botButtons, ephemeral: true, });

        async function getUsers() {
            // Fast but inaccurate method
            let userCount = 0;
            await client.guilds.cache.forEach(guild => {
                if (guild.memberCount) userCount += guild.memberCount;
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
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "botinfo",
    description: `Displays info on this bot.`
};