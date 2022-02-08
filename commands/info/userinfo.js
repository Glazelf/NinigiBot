const Discord = require("discord.js");
exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const { bank } = require('../../database/bank');
        const { Users } = require('../../database/dbObjects');
        const parseDate = require('../../util/parseDate')
        const badgeEmotes = require('../../objects/discord/badgeEmotes.json');

        let user;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = await message.mentions.users.first();
            // force fetch
            if (user) user = await client.users.fetch(user.id, { force: true });
        };

        if (!user && args[0]) {
            try {
                let userID = args[0];
                user = await client.users.fetch(userID, { force: true });
            } catch (e) {
                // console.log();
            };
        };

        if (!user) {
            user = await client.users.fetch(message.member.id, { force: true });
        };

        let member;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch (e) {
            // console.log(e);
            return sendMessage({ client: client, message: message, content: `No member information could be found for this user.` });
        };

        // Balance check
        let dbBalance = await bank.currency.getBalance(user.id);
        let userBalance = `${Math.floor(dbBalance)}${globalVars.currency}`;
        let switchCode = await bank.currency.getSwitchCode(user.id);

        let birthday = await bank.currency.getBirthday(user.id);
        let birthdayParsed = parseDate(birthday);

        // Roles
        let memberRoles = member.roles.cache.filter(element => element.name !== "@everyone");
        let rolesSorted = "None";
        let shortenedRoles;
        if (memberRoles.size !== 0) {
            rolesSorted = await memberRoles.sort((r, r2) => r2.position - r.position);
            rolesSorted = [...rolesSorted.values()].join(", ");
            for (i = rolesSorted.length; i > 1024; i = rolesSorted.length) {
                rolesSorted = rolesSorted.split(", ");
                await rolesSorted.pop();
                rolesSorted = rolesSorted.join(", ");
                shortenedRoles = true;
            };
            if (shortenedRoles) rolesSorted = `${rolesSorted} and more!`;
        };
        let roleCount = memberRoles.size;
        let roleTitle = `Roles:`;
        if (roleCount > 0) roleTitle = `Roles: (${roleCount})`;

        // Clear up status wording
        let userStatus;
        let activityLog = '';
        let customStatus = '';
        let actBool = false;
        if (member.presence) {
            // Online status string correction
            switch (member.presence.status) {
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

            // Activities to string
            const activities = member.presence.activities;
            for (const act in activities) {
                if (activities[act].name === 'Custom Status') {
                    let emoji = null;
                    if (activities[act].emoji) emoji = await client.emojis.cache.get(activities[act].emoji.id);
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

                // Custom status handling
                actBool = new Boolean(activities[0]);
                if (actBool == true) {
                    if (activities[0].name === 'Custom Status') {
                        actBool = new Boolean(activities[1]);
                    };
                };
            };
        } else {
            userStatus = "Offline";
        };

        // Avatar and banner
        let serverAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
        let avatar = user.displayAvatarURL(globalVars.displayAvatarSettings);
        let banner = null;
        if (user.banner) banner = user.bannerURL({ format: "png", dynamic: true, size: 256 });

        // Accent color
        let embedColor = globalVars.embedColor;
        if (user.accentColor) embedColor = user.accentColor;

        // Profile badges
        let badgesArray = [];
        let badgesString = "";
        try {
            if (user.bot) badgesArray.push("🤖");
            if (member.premiumSince > 0) badgesArray.push(`<:nitro_boost:753268592081895605>`);
            if (user.flags) {
                for (const [key, value] of Object.entries(badgeEmotes)) {
                    if (user.flags.has(key)) badgesArray.push(value);
                };
            };
            badgesString = badgesArray.join(" ");
        } catch (e) {
            // console.log(e);
        };

        // JoinRank
        let joinRank = await getJoinRank(user.id, message.guild);
        let joinPercentage = Math.ceil(joinRank / message.guild.memberCount * 100);
        let joinRankText = `${joinRank}/${message.guild.memberCount} (${joinPercentage}%)`;

        // Buttons
        let profileButtons = new Discord.ActionRow()
            .addComponents(new Discord.ButtonComponent({ label: 'Profile', style: Discord.ButtonStyle.Link, url: `discord://-/users/${user.id}` }));

        const profileEmbed = new Discord.Embed()
            .setColor(embedColor)
            .setAuthor({ name: `${user.username} (${user.id})`, iconURL: avatar })
            .setThumbnail(serverAvatar)
            .addField("Account:", `${user} ${badgesString}`, true)
            .addField("Availability:", userStatus, true);
        if (!user.bot) profileEmbed.addField("Balance:", userBalance, true);
        if (customStatus.length >= 1 && customStatus !== 'null' && member.presence) profileEmbed.addField("Custom Status:", customStatus, true);
        if (birthday && birthdayParsed) profileEmbed.addField("Birthday:", birthdayParsed, true);
        if (actBool == true && member.presence) profileEmbed.addField("Activities:", activityLog, false);
        if (switchCode && switchCode !== 'None') profileEmbed.addField("Switch FC:", switchCode, true);
        profileEmbed
            .addField("Join Ranking:", joinRankText, true)
            .addField(roleTitle, rolesSorted, false)
            .addField("Created:", `<t:${Math.floor(user.createdAt.valueOf() / 1000)}:R>`, true)
            .addField("Joined:", `<t:${Math.floor(member.joinedAt.valueOf() / 1000)}:R>`, true);
        if (member.premiumSince > 0) profileEmbed.addField(`Boosting Since:`, `<t:${Math.floor(member.premiumSince.valueOf() / 1000)}:R>`, true);
        if (banner) profileEmbed.setImage(banner);
        profileEmbed
            .setFooter({ text: user.tag })
            .setTimestamp();

        return sendMessage({ client: client, message: message, embeds: profileEmbed, components: profileButtons });

        async function getJoinRank(userID, guild) {
            let user = await guild.members.fetch(userID);
            if (!user) return;
            await guild.members.fetch();
            // Sort all users by join time
            let arr = [...guild.members.cache.values()];
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
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "Userinfo",
    type: Discord.ApplicationCommandOptionType.User,
    aliases: ["user", "profile"]
};