const Discord = require("discord.js");
exports.run = async (client, interaction, logger, globalVars, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        const axios = require("axios");
        let ownerBool = await isOwner(client, interaction.user);

        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
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
        // Get latest commit
        let githubURLVars = "Glazelf/NinigiBot";
        let githubRepoResponse = null;
        let githubMasterResponse = null;
        try {
            githubRepoResponse = await axios.get(`https://api.github.com/repos/${githubURLVars}`);
            githubMasterResponse = await axios.get(`https://api.github.com/repos/${githubURLVars}/branches/master`);
        } catch (e) {
            // console.log(e);
            githubRepoResponse = null;
            githubMasterResponse = null;
        };
        // Timestamps are divided by 1000 to convert from milliseconds (unix) to seconds (Disord timestamps)
        let createdAt = Math.floor(client.user.createdAt.valueOf() / 1000);
        let date = Date.now();
        let onlineSince = Math.floor((date - client.uptime) / 1000);
        let lastCommitTimestamp = Math.floor(new Date(githubMasterResponse.data.commit.commit.author.date).getTime() / 1000);

        let lastCommitMessage = `"[${githubMasterResponse.data.commit.commit.message.split("\n")[0]}](https://github.com/${githubURLVars}/commit/${githubMasterResponse.data.commit.sha})"`;
        let lastCommitAuthor = `-[${githubMasterResponse.data.commit.author.login}](https://github.com/${githubMasterResponse.data.commit.author.login})`;
        let lastCommitString = `${lastCommitMessage}\n${lastCommitAuthor}\n<t:${lastCommitTimestamp}:R>`;

        let avatar = client.user.displayAvatarURL(globalVars.displayAvatarSettings);
        // Owner
        let owner = "glazelf (232875725898645504)";

        let botEmbed = new Discord.EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setAuthor({ name: client.user.username })
            .setThumbnail(avatar)
            .setDescription(githubRepoResponse.data.description)
            .addFields([
                { name: "Owner:", value: owner, inline: false },
                { name: "Library:", value: `Discord.JS v${DiscordJSVersion}`, inline: true }
            ]);
        if (ownerBool) botEmbed.addFields([{ name: "Memory Usage:", value: memoryUsage, inline: true }]);
        if (client.shard) botEmbed.addFields([{ name: "Shards:", value: ShardUtil.count.toString(), inline: true }]);
        botEmbed.addFields([
            { name: "Servers:", value: totalGuilds.toString(), inline: true },
            { name: "Total Users:", value: totalMembers.toString(), inline: true },
            { name: "Created:", value: `<t:${createdAt}:f>`, inline: true },
            { name: "Online Since:", value: `<t:${onlineSince}:R>`, inline: true }
        ]);
        if (githubRepoResponse) botEmbed.addFields([{ name: "Github Stars:", value: `[${githubRepoResponse.data.stargazers_count}](https://github.com/${githubURLVars}/stargazers)⭐`, inline: true }]);
        if (githubMasterResponse) botEmbed.addFields([{ name: "Latest Commit:", value: lastCommitString, inline: true }]);

        let botButtons = new Discord.ActionRowBuilder()
            .addComponents(new Discord.ButtonBuilder({ label: 'Invite Bot', style: Discord.ButtonStyle.Link, url: `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands` }))
            .addComponents(new Discord.ButtonBuilder({ label: 'App Directory', style: Discord.ButtonStyle.Link, url: `https://discord.com/application-directory/${client.user.id}` }))
            .addComponents(new Discord.ButtonBuilder({ label: 'Github', style: Discord.ButtonStyle.Link, url: `https://github.com/${githubURLVars}` }))
            .addComponents(new Discord.ButtonBuilder({ label: 'Support Server', style: Discord.ButtonStyle.Link, url: `https://discord.gg/${globalVars.ShinxServerInvite}` }))
        return sendMessage({ client: client, interaction: interaction, embeds: botEmbed, components: botButtons, ephemeral: ephemeral });

        async function getUsers() {
            // Fast but inaccurate method
            let userCount = 0;
            await client.guilds.cache.forEach(guild => {
                if (guild.memberCount) userCount += guild.memberCount;
            });
            return userCount;
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "botinfo",
    description: `Displays info about this bot.`,
    options: [{
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};