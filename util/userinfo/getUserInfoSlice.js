import Discord from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import { getUser } from "../../database/dbServices/user.api.js";
import parseDate from "../../util/parseDate.js";
import isAdmin from "../../util/isAdmin.js";
import badgeEmotes from "../../objects/discord/badgeEmotes.json" with { type: "json" };

const number_of_pages = 2;

export default async (client, interaction, page, user) => {
    user = await client.users.fetch(user.id, { force: true });
    let member = await interaction.guild.members.fetch(user.id).catch(e => { return null; });
    // Accent color
    let embedColor = globalVars.embedColor;
    if (user.accentColor) embedColor = user.accentColor;
    // Avatar
    let serverAvatar = null;
    if (member) serverAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
    let avatar = user.displayAvatarURL(globalVars.displayAvatarSettings);

    const profileEmbed = new Discord.EmbedBuilder()
        .setColor(embedColor)
        .setAuthor({ name: user.username, iconURL: avatar })
        .setThumbnail(serverAvatar);
    let profileButtons = new Discord.ActionRowBuilder()
        .addComponents(new Discord.ButtonBuilder({ label: 'Profile', style: Discord.ButtonStyle.Link, url: `discord://-/users/${user.id}` }));
    if (page > 0) profileButtons.addComponents(new Discord.ButtonBuilder({ customId: `usf${page - 1}:${user.id}`, style: Discord.ButtonStyle.Primary, emoji: '⬅️' }));
    if (page < number_of_pages - 1 && member && !user.bot) profileButtons.addComponents(new Discord.ButtonBuilder({ customId: `usf${page + 1}:${user.id}`, style: Discord.ButtonStyle.Primary, emoji: '➡️' }));

    let user_db = await getUser(user.id, ['swcode', 'money', 'birthday', 'user_id', 'food']);
    switch (page) {
        case 0:

            let adminBot = isAdmin(client, interaction.guild.members.me);
            let switchCode = user_db.swcode;
            let birthday = user_db.birthday;
            let birthdayParsed = parseDate(birthday);
            // Roles
            let memberRoles = null;
            if (member) memberRoles = member.roles.cache.filter(element => element.name !== "@everyone");
            let rolesSorted = "None";
            let shortenedRoles;
            if (memberRoles && memberRoles.size !== 0) {
                rolesSorted = await memberRoles.sort((r, r2) => r2.position - r.position);
                rolesSorted = [...rolesSorted.values()].join(", ");
                for (let i = rolesSorted.length; i > 1024; i = rolesSorted.length) {
                    rolesSorted = rolesSorted.split(", ");
                    await rolesSorted.pop();
                    rolesSorted = rolesSorted.join(", ");
                    shortenedRoles = true;
                };
                if (shortenedRoles) rolesSorted = `${rolesSorted} and more!`;
            };
            let roleCount = 0;
            if (memberRoles) roleCount = memberRoles.size;
            // Banner
            let banner = null;
            if (user.banner) banner = user.bannerURL(globalVars.displayAvatarSettings);
            // Profile badges
            let badgesArray = [];
            let badgesString = "";
            if (interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) || adminBot) {
                try {
                    if (user.bot) badgesArray.push("🤖");
                    let guildOwner = await interaction.guild.fetchOwner();
                    if (guildOwner.id === user.id) badgesArray.push("👑");
                    if (member && member.premiumSince > 0) badgesArray.push(`<:nitro_boost:753268592081895605>`);
                    if (user.flags) {
                        let userFlagsAll = user.flags.serialize();
                        let flagsArray = Object.entries(userFlagsAll);
                        let userFlagsTrueEntries = flagsArray.filter(([key, value]) => value === true);
                        let userFlagsTrue = Object.fromEntries(userFlagsTrueEntries);
                        for (const [key, value] of Object.entries(badgeEmotes)) {
                            if (Object.keys(userFlagsTrue).includes(key)) badgesArray.push(value);
                        };
                    };
                    badgesString = badgesArray.join("");
                } catch (e) {
                    // console.log(e);
                };
            };
            let joinRank = await getJoinRank(user, interaction.guild);
            let joinPercentage = Math.ceil(joinRank / interaction.guild.memberCount * 100);
            let joinRankText = `${joinRank}/${interaction.guild.memberCount} (${joinPercentage}%)`;
            profileEmbed.addFields([{ name: "Account:", value: `${user} ${badgesString}`, inline: true }]);
            if (birthday && birthdayParsed && member) profileEmbed.addFields([{ name: "Birthday:", value: birthdayParsed, inline: true }]);
            if (switchCode && switchCode !== 'None' && member) profileEmbed.addFields([{ name: "Switch FC:", value: switchCode, inline: true }]);
            if (joinRank) profileEmbed.addFields([{ name: "Join Ranking:", value: joinRankText, inline: true }]);
            if (memberRoles) profileEmbed.addFields([{ name: `Roles: (${roleCount})`, value: rolesSorted, inline: false }]);
            profileEmbed.addFields([{ name: "Created:", value: `<t:${Math.floor(user.createdAt.valueOf() / 1000)}:f>`, inline: true }]);
            if (member) profileEmbed.addFields([{ name: "Joined:", value: `<t:${Math.floor(member.joinedAt.valueOf() / 1000)}:R>`, inline: true }]);
            if (member && member.premiumSince > 0) profileEmbed.addFields([{ name: `Boosting Since:`, value: `<t:${Math.floor(member.premiumSince.valueOf() / 1000)}:R>`, inline: true }]);
            if (banner) profileEmbed.setImage(banner);
            profileEmbed.setFooter({ text: user.id });
            break;
        case 1:
            // Balance check
            let dbBalance = user_db.money;
            dbBalance = Math.floor(dbBalance);
            let userBalance = `${dbBalance}${globalVars.currency}`;
            profileEmbed.addFields([
                { name: "Balance:", value: userBalance, inline: true },
                { name: "Food:", value: user_db.food.toString() + ' :poultry_leg:', inline: true }
            ]);
            let trophy_level = 0;
            let trophy_string = '';
            let trophies = await user_db.getShopTrophies();
            trophies.forEach(trophy => {
                trophy_string += (trophy.icon + ' ');
            });
            trophy_level += trophies.length;
            trophies = await user_db.getEventTrophies();
            trophies.forEach(trophy => {
                trophy_string += (trophy.icon + ' ');
            });
            trophy_level += trophies.length;
            if (trophy_string.length > 0) {
                profileEmbed.addFields([
                    { name: "Trophy Level:", value: trophy_level + ' :beginner:', inline: true },
                    { name: "Trophies:", value: trophy_string, inline: true }
                ]);
            };
            break;
    };
    return {
        client: client,
        interaction: interaction,
        embeds: profileEmbed,
        components: profileButtons
    };
};

async function getJoinRank(user, guild) {
    if (!user) return;
    await guild.members.fetch();
    // Sort all users by join time
    let arr = [...guild.members.cache.values()];
    arr.sort((a, b) => a.joinedAt - b.joinedAt);
    // Get provided user
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == user.id) return i + 1;
    };
};

function capitalizeString(str) {
    let firstCharUpper = str[0].toUpperCase();
    let rest = str.substring(1).toLowerCase();
    let string = `${firstCharUpper}${rest} `;
    return string;
};