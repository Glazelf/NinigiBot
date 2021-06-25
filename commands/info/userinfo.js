module.exports.run = async (client, message, args = []) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const { bank } = require('../../database/bank');
        const { Users } = require('../../database/dbObjects');
        const checkDays = require('../../util/checkDays');
        const badgeEmotes = require('../../objects/discord/badgeEmotes.json');

        let user;
        if (message.mentions) {
            user = message.mentions.users.first();
        };

        if (!user && args[0]) {
            let userID = args[0];
            user = await client.users.fetch(userID);
            if (!user) user = await client.users.cache.find(user => user.username.toLowerCase() == args[0].toString().toLowerCase());
        };

        if (!user) {
            user = message.member.user;
        };

        let member = await message.guild.members.fetch(user.id);
        if (!member) return sendMessage(client, message, `No member information could be found for this user.`);

        // Balance check
        let userBalance = `${Math.floor(bank.currency.getBalance(user.id))}${globalVars.currency}`;
        let switchCode = bank.currency.getSwitchCode(user.id);
        let birthday = bank.currency.getBirthday(user.id);
        let birthdayParsed = require('../../util/parseDate')(birthday);

        // Roles
        let memberRoles = member.roles.cache.filter(element => element.name !== "@everyone");
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
        const activities = member.presence.activities;
        for (const act in activities) {
            if (activities[act].name === 'Custom Status') {
                let emoji = null;
                if (activities[act].emoji) emoji = client.emojis.cache.get(activities[act].emoji.id);
                if (emoji) customStatus = emoji.toString() + ' ';
                // Sometimes regular null catch seems to work, sometimes it needs "null". I'm not sure what the fuck is happening. I hate Javascript.
                if (activities[act].state && activities[act].state !== "null") customStatus += activities[act].state;
            } else {
                if (activities[act].type) {
                    let actType = activities[act].type;
                    if (actType == "COMPETING") actType += " IN";
                    let activityType = capitalizeString(actType);
                    activityLog += activityType;
                };
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

        // Badges / Emotes
        let nitroEmote = "<:nitro_boost:753268592081895605>";

        // Profile badges
        let badgesArray = [];
        if (user.bot) badgesArray.push("🤖");
        if (member.premiumSince > 0) badgesArray.push(`${nitroEmote}`);
        if (user.flags) {
            for (const [key, value] of Object.entries(badgeEmotes)) {
                if (user.flags.has(key)) badgesArray.push(value);
            };
        };
        let badgesString = badgesArray.join(" ");

        // JoinRank
        let joinRank = `${getJoinRank(user.id, message.guild)}/${message.guild.memberCount}`;

        // Check Days
        let daysJoined = await checkDays(member.joinedAt);
        let daysBoosting;
        if (member.premiumSince > 0) {
            daysBoosting = await checkDays(member.premiumSince);
        };
        let daysCreated = await checkDays(user.createdAt);

        const profileEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor)
            .setAuthor(`${user.username} (${user.id})`, avatar)
            .setThumbnail(avatar)
            .addField("Account:", `${user} ${badgesString}`, true)
            .addField("Availability:", userStatus, true);
        if (!user.bot) profileEmbed.addField("Balance:", userBalance, true);
        if (customStatus.length >= 1 && customStatus !== 'null') profileEmbed.addField("Custom Status:", customStatus, true);
        if (birthday && birthdayParsed) profileEmbed.addField("Birthday:", birthdayParsed, true);
        if (actBool == true) profileEmbed.addField("Activities:", activityLog, false);
        if (switchCode && switchCode !== 'None') profileEmbed.addField("Switch FC:", switchCode, true);
        profileEmbed
            .addField("Join Ranking:", joinRank, true)
            .addField("Roles:", rolesSorted, false)
            .addField("Created:", `${user.createdAt.toUTCString().substr(5,)}\n${daysCreated}`, true)
            .addField("Joined:", `${member.joinedAt.toUTCString().substr(5,)}\n${daysJoined}`, true);
        if (member.premiumSince > 0) profileEmbed.addField(`Boosting Since:`, `${member.premiumSince.toUTCString().substr(5,)}\n${daysBoosting}`, true);
        profileEmbed
            .setFooter(message.member.user.tag)
            .setTimestamp();

        return sendMessage(client, message, null, profileEmbed);

        function getJoinRank(userID, guild) {
            if (!guild.members.cache.get(userID)) return;
            // Sort all users by join time
            let arr = guild.members.cache.array();
            arr.sort((a, b) => a.joinedAt - b.joinedAt);
            // Get provided user
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id == userID) return i + 1;
            };
        };

        function capitalizeString(str) {
            let firstCharUpper = str[0].toUpperCase();
            let rest = str.substring(1).toLowerCase();
            let string = `${firstCharUpper}${rest} `;
            return string;
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