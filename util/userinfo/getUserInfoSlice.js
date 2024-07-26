import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import { getUser } from "../../database/dbServices/user.api.js";
import parseDate from "../../util/parseDate.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import badgeEmojis from "../../objects/discord/badgeEmojis.json" with { type: "json" };
import emojis from "../../objects/discord/emojis.json" with { type: "json" };

const number_of_pages = 2;

export default async (interaction, page, user) => {
    user = await interaction.client.users.fetch(user.id, { force: true });
    let member = null;
    if (interaction.inGuild()) member = await interaction.guild.members.fetch(user.id).catch(e => { return null; });
    // Accent color
    let embedColor = globalVars.embedColor;
    if (user.accentColor) embedColor = user.accentColor;
    // Avatar
    let serverAvatar = null;
    if (member) serverAvatar = member.displayAvatarURL(globalVars.displayAvatarSettings);
    let avatar = user.displayAvatarURL(globalVars.displayAvatarSettings);

    const profileEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setAuthor({ name: user.username, iconURL: avatar })
        .setThumbnail(serverAvatar);
    let profileButtons = new ActionRowBuilder();
    const profileButton = new ButtonBuilder()
        .setLabel("Profile")
        .setStyle(ButtonStyle.Link)
        .setURL(`discord://-/users/${user.id}`);
    profileButtons.addComponents(profileButton);
    if (member && !user.bot) {
        const previousPageButton = new ButtonBuilder()
            .setCustomId(`usf${page - 1}:${user.id}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⬅️');
        if (page < 1) previousPageButton.setDisabled(true);
        profileButtons.addComponents(previousPageButton);
        const nextPageButton = new ButtonBuilder()
            .setCustomId(`usf${page + 1}:${user.id}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➡️');
        if (page >= number_of_pages - 1) nextPageButton.setDisabled(true);
        profileButtons.addComponents(nextPageButton);
    };

    let user_db = await getUser(user.id, ['swcode', 'money', 'birthday', 'user_id', 'food']);
    switch (page) {
        case 0:
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
            try {
                if (user.bot) badgesArray.push("🤖");
                let guildOwner = await interaction.guild.fetchOwner();
                if (guildOwner.id === user.id) badgesArray.push("👑");
                if (member && member.premiumSince > 0) badgesArray.push(emojis.NitroBoost);
                if (user.flags) {
                    let userFlagsAll = user.flags.serialize();
                    let flagsArray = Object.entries(userFlagsAll);
                    let userFlagsTrueEntries = flagsArray.filter(([key, value]) => value === true);
                    let userFlagsTrue = Object.fromEntries(userFlagsTrueEntries);
                    for (const [key, value] of Object.entries(badgeEmojis)) {
                        if (Object.keys(userFlagsTrue).includes(key)) badgesArray.push(value);
                    };
                };
                badgesString = badgesArray.join("");
            } catch (e) {
                // console.log(e);
            };
            let joinRank, joinPercentage, joinRankText = null;
            if (interaction.inGuild()) {
                joinRank = await getJoinRank(user, interaction.guild);
                joinPercentage = Math.ceil(joinRank / interaction.guild.memberCount * 100);
                joinRankText = `${joinRank}/${interaction.guild.memberCount} (${joinPercentage}%)`;
            };
            profileEmbed.addFields([{ name: "Account:", value: `${user}\n${badgesString}`, inline: true }]);
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
