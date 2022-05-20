exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
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

        // Avatar and banner
        let serverAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
        let avatar = user.displayAvatarURL(globalVars.displayAvatarSettings);
        let banner = null;
        if (user.banner) banner = user.bannerURL(globalVars.displayAvatarSettings);

        // Accent color
        let embedColor = globalVars.embedColor;
        if (user.accentColor) embedColor = user.accentColor;

        // Profile badges
        let badgesArray = [];
        let badgesString = "";
        if (guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) {
            try {
                if (user.bot) badgesArray.push("🤖");
                if (member.premiumSince > 0) badgesArray.push(`<:nitro_boost:753268592081895605>`);
                if (user.flags) {
                    let userFlagsAll = user.flags.serialize();
                    let flagsArray = Object.entries(userFlagsAll);
                    let userFlagsTrueEntries = flagsArray.filter(([key, value]) => value === true);
                    let userFlagsTrue = Object.fromEntries(userFlagsTrueEntries);

                    for (const [key, value] of Object.entries(badgeEmotes)) {
                        console.log(value)
                        if (Object.keys(userFlagsTrue).includes(key)) badgesArray.push(value);
                    };
                };
                badgesString = badgesArray.join("");
            } catch (e) {
                // console.log(e);
            };
        };

        // JoinRank
        let joinRank = await getJoinRank(user.id, message.guild);
        let joinPercentage = Math.ceil(joinRank / message.guild.memberCount * 100);
        let joinRankText = `${joinRank}/${message.guild.memberCount} (${joinPercentage}%)`;

        // Buttons
        let profileButtons = new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${user.id}` }));

        const profileEmbed = new Discord.MessageEmbed()
            .setColor(embedColor)
            .setAuthor({ name: `${user.username} (${user.id})`, iconURL: avatar })
            .setThumbnail(serverAvatar)
            .addField("Account:", `${user} ${badgesString}`, true)
        if (!user.bot) profileEmbed.addField("Balance:", userBalance, true);
        if (birthday && birthdayParsed) profileEmbed.addField("Birthday:", birthdayParsed, true);
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
    type: 2,
    aliases: ["user", "profile"]
};