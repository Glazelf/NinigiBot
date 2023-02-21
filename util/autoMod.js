module.exports = async (client, message) => {
    const Discord = require("discord.js");
    let getTime = require('../util/getTime');
    const isAdmin = require('./isAdmin');
    let adminBool = isAdmin(client, message.member);
    const Sequelize = require('sequelize');
    const { serverdata} =  require('../database/dbConnection/dbConnection');
    const { ModEnabledServers } = require('../database/dbObjects/serverdata.model')(serverdata, Sequelize.DataTypes);
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    if (!servers.includes(message.guild.id)) return false;
    if (!message.member) return false;
    if (message.member.permissions.has("MANAGE_MESSAGES") || message.member.permissions.has("KICK_MEMBERS") || adminBool) return false;
    if (!message.content) return false;

    let time = await getTime(client);

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let messageNormalized = message.content
        .replace(/[\uff01-\uff5e]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 0xfee0); }) // convert full-width to half-width
        .normalize("NFD") // standard normalization
        .replace(/[\u0300-\u036f]/g, "") // idk lol
        .replace(/\W/g, "") // ???
        .replace(" ", "") // remove spaces
        .toLowerCase();

    let messageContentBlock = "";
    if (message.content.length > 0) messageContentBlock = Discord.Formatters.codeBlock(message.content);

    const genericLinks = [
        "http.?:\/\/[^s]*.*..{1,}"
    ];
    let genericLinkRegex = new RegExp(genericLinks.join("|"), "i");

    const scamLinks = [
        "http.?:\/\/(dicsord-nitro|discrod-egifts|steamnitro|discordgift|discordc|discorcl|dizcord|dicsord|dlscord|dlcsorcl|dlisocrd|djscord-airdrops).(com|org|ru|click|gift|net)", // Discord gift links
        // "http.?:\/\/.*\.ru", // Russian websites, should fix, re-add and enable this for any servers that aren't russian when language is done. Currently matches any URL containing "ru" after a period. Can't seem to replicate this on online regex testers though
        "http.?:\/\/gidthub.com"
    ];
    let scamRegex = new RegExp(scamLinks.join("|"), "i");

    const adLinks = [
        "discord.gg",
        "bit.ly",
        "twitch.tv"
    ];
    let adRegex = new RegExp(adLinks.join("|"), "i");

    const testArray = [
        "triceratops"
    ];
    let testRegex = new RegExp(testArray.join("|"), "i");

    // Scam links
    let specificScamLink = scamRegex.test(message.content);
    let genericLinkPing = genericLinkRegex.test(message.content) && message.content.includes("@everyone") && message.mentions.everyone == false;
    if (specificScamLink || genericLinkPing) {
        reason = "Posting scam links.";
        await ban();
        return true;
    };
    // Ad links
    if (adRegex.test(message.content) && memberRoles.size == 0) {
        reason = "Advertisement.";
        await msgDelete();
        return true;
    };
    // Test
    // if (testRegex.test(messageNormalized)) {
    //     test();
    // };

    async function msgDelete() {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return;
        await message.delete();
        return message.channel.send({ content: `Deleted a message by **${message.author.tag}** (${message.author.id}) for the following reason: \`${reason}\`` });
        // return true;
    };

    async function kick() {
        if (!message.member.kickable) return false;
        await message.delete();

        let dmResult = "(DM succeeded)";

        try {
            await message.author.send({ content: `You've been automatically kicked for the following reason: \`${reason}\`\n${messageContentBlock}` });
        } catch (e) {
            // console.log(e);
            dmResult = "(DM failed)";
        };

        try {
            await message.member.kick([`${reason} -${client.user.tag} (${time})`]);
        } catch (e) {
            // console.log(e);
            await message.channel.send({ content: `Failed to auto-kick **${message.author.tag}** (${message.author.id}). This is probably a permission issue.` });
            return false;
        };

        await message.channel.send({ content: `Automatically kicked **${message.author.tag}** (${message.author.id}) for the following reason: \`${reason}\` ${dmResult}` });

        return true;
    };

    async function ban() {
        if (!message.member.bannable) return false;

        let dmResult = "(DM succeeded)";

        try {
            await message.author.send({ content: `You've been automatically banned for the following reason: \`${reason}\`\n${messageContentBlock}` });
        } catch (e) {
            // console.log(e);
            dmResult = "(DM failed)";
        };

        try {
            await message.member.ban({ days: 1, reason: `${reason} -${client.user.tag} (${time})` });
        } catch (e) {
            // console.log(e);
            await message.channel.send({ content: `Failed to auto-ban **${message.author.tag}** (${message.author.id}). This is probably a permission issue.` });
            return false;
        };

        await message.channel.send({ content: `Automatically banned **${message.author.tag}** (${message.author.id}) for the following reason: \`${reason}\` ${dmResult}` });

        return true;
    };

    async function test() {
        await message.channel.send({ content: `banned lol` });
        return true;
    };
};