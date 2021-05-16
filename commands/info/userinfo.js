module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const Discord = require("discord.js");
        const { bank } = require('../../database/bank');
        const { Users } = require('../../database/dbObjects');
        const checkDays = require('../../util/checkDays');

        let memberFetch = await message.guild.members.fetch();
        let user = message.mentions.users.first();
        let member = message.mentions.members.first();

        if (!user) {
            const input = message.content.split(` `, 2);
            let userID = input[1];
            user = client.users.cache.get(userID);
        };

        if (!user) {
            user = message.author;
        };

        if (!member) {
            member = message.member;
        };

        let memberCache = memberFetch.get(user.id);
        if (!memberCache) return message.channel.send(`> No member information could be found for this user, ${message.author}.`);

        // Balance check
        let userBalance = `${Math.floor(bank.currency.getBalance(user.id))}${globalVars.currency}`;
        let switchCode = bank.currency.getSwitchCode(user.id);
        let biography = bank.currency.getBiography(user.id);
        let birthday = bank.currency.getBirthday(user.id);
        let birthdayParsed = require('../../util/parseDate')(birthday);

        // Roles
        let memberRoles = memberCache.roles.cache.filter(element => element.name !== "@everyone");
        let rolesSorted = "None";
        let shortenedRoles = false;
        if (memberRoles.size !== 0) {
            rolesSorted = await memberRoles.sort((r, r2) => r2.position - r.position).array().join(", ");
            for (i = rolesSorted.length; i > 1024; i = rolesSorted.length) {
                rolesSorted = rolesSorted.split(", ");
                await rolesSorted.pop();
                rolesSorted = rolesSorted.join(", ");
                shortenedRoles = true;
            };
            if (shortenedRoles) rolesSorted = `${rolesSorted} and more!`;
        };

        // Clear up status wording
        let userStatus = "Error";
        switch (user.presence.status) {
            case "online":
                userStatus = "Online";
                break;
            case "idle":
                userStatus = "Idle";
                break;
            case "dnd":
                userStatus = "Busy";
                break;
            case "invisible":
                userStatus = "Invisible";
                break;
            case "offline":
                userStatus = "Offline";
                break;
        };

        //Activities to string
        let activityLog = '';
        let customStatus = '';
        const activities = memberCache.presence.activities;
        for (const act in activities) {
            if (activities[act].name === 'Custom Status') {
                let emoji = null;
                if (activities[act].emoji) emoji = client.emojis.cache.get(activities[act].emoji.id);
                if (emoji) customStatus = emoji.toString() + ' ';
                // Sometimes regular null catch seems to work, sometimes it needs "null". I'm not sure what the fuck is happening. I hate Javascript.
                if (activities[act].state && activities[act].state !== "null") customStatus += activities[act].state;
            } else {
                activityLog += activities[act].name;
                if (activities[act].details || activities[act].state) activityLog += ': ';
                if (activities[act].details) activityLog += activities[act].details;
                if (activities[act].details && activities[act].state) activityLog += ', ';
                if (activities[act].state) activityLog += activities[act].state;
                activityLog += '\n';
            };
        };

        let actBool = new Boolean(activities[0]);
        if (actBool == true) {
            if (activities[0].name === 'Custom Status') {
                actBool = new Boolean(activities[1]);
            };
        };

        // Avatar
        let avatar = user.displayAvatarURL({ format: "png", dynamic: true });

        // Nitro Boost check
        let nitroEmote = "<:nitroboost:753268592081895605>";
        let userText = user;
        if (memberCache.premiumSince > 0) userText = `${user} ${nitroEmote}`;
        if (user.bot) userText = `${user} 🤖`;

        // JoinRank
        let joinRank = `${getJoinRank(user.id, message.guild) + 1}/${message.guild.memberCount}`;

        // Check Days
        let daysJoined = await checkDays(memberCache.joinedAt);
        let daysBoosting;
        if (memberCache.premiumSince > 0) {
            daysBoosting = await checkDays(memberCache.premiumSince);
        };
        let daysCreated = await checkDays(user.createdAt);

        const profileEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${user.tag} (${user.id})`, avatar)
            .setThumbnail(avatar)
            .addField("Account:", userText, true)
            .addField("Availability:", userStatus, true);
        if (!user.bot) profileEmbed.addField("Balance:", userBalance, true);
        if (customStatus.length >= 1 && customStatus !== 'null') profileEmbed.addField("Custom Status:", customStatus, true);
        if (birthday && birthdayParsed) profileEmbed.addField("Birthday:", birthdayParsed, true);
        if (actBool == true) profileEmbed.addField("Activities:", activityLog, false);
        if (switchCode && switchCode !== 'None') profileEmbed.addField("Switch FC:", switchCode, true);
        if (biography && biography !== 'None') profileEmbed.addField("Biography:", biography, true);
        profileEmbed
            .addField("Join ranking:", joinRank, true)
            .addField("Roles:", rolesSorted, false)
            .addField("Joined at:", `${memberCache.joinedAt.toUTCString().substr(5,)}\n${daysJoined}`, true);
        if (memberCache.premiumSince > 0) profileEmbed.addField(`Boosting since:`, `${memberCache.premiumSince.toUTCString().substr(5,)}\n${daysBoosting}`, true);
        profileEmbed
            .addField("Created at:", `${user.createdAt.toUTCString().substr(5,)}\n${daysCreated}`, true)
            .setFooter(message.author.tag)
            .setTimestamp();

        return message.reply(profileEmbed);

        function getJoinRank(userID, guild) {
            if (!guild.members.cache.get(userID)) return;
            // Sort all users by join time
            let arr = guild.members.cache.array();
            arr.sort((a, b) => a.joinedAt - b.joinedAt);
            // Get provided user
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == userID) return i;
            };
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "userinfo",
    aliases: ["user", "profile"],
    description: "Displays information about a specified user.",
    options: [{
        name: "user-mention",
        type: "MENTIONABLE",
        description: "Specify user by mention."
    }, {
        name: "user-id",
        type: "STRING",
        description: "Specify user by ID."
    }]
};