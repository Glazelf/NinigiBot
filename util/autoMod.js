module.exports = async (client, message) => {
    const Discord = require("discord.js");
    let getTime = require('../util/getTime');
    const { ModEnabledServers } = require('../database/dbObjects');
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    if (!servers.includes(message.guild.id)) return;
    if (!message.member) return;
    if (message.member.permissions.has("MANAGE_MESSAGES")) return;
    if (!message.content) return;

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

    const scamLinks = [
        ".*http(.)?:\/\/(dicsord-nitro|steamnitro|discordgift|discorcl|dicsord|dlscord|dlcsorcl).(com|org|ru|click|gift|net).*", // Discord gift links
        ".*http(.)?:\/\/[^s]*.ru.*" // Russian websites, should disable this for russian discords lol
    ];
    let scamRegex = new RegExp(scamLinks.join("|"), "i");

    const adLinks = [
        "discord.gg",
        "bit.ly",
        "twitch.tv"
    ];
    let adRegex = new RegExp(adLinks.join("|"), "i");

    const globalSlurs = [
        "(n){1,32}(i|l){1,32}((g{2,32}|q){1,32}|[gq]{2,32}|(b){2,32})((er){1,32}|[ra]{1,32})", // Variations of the n-word
        "neger", // Thanks Ewok
        "niglet", // Thanks Ewok but idt I can easily fit this one into the regex above
        "faggot",
        "tranny",
        "(retard)(?!ation)" // Retard but not retardation
    ];
    let slurRegex = new RegExp(globalSlurs.join("|"), "i");

    // Language exceptions currently unused
    const exceptionsFrench = [
        "retard"
    ];
    let exceptionsFrenchRegex = new RegExp(exceptionsFrench.join("|"), "i");

    const exceptionsSpanish = [
        "negro"
    ];
    let exceptionsSpanishRegex = new RegExp(exceptionsSpanish.join("|"), "i");

    const testArray = [
        "triceratops"
    ];
    let testRegex = new RegExp(testArray.join("|"), "i");

    // Scam links
    if (scamRegex.test(messageNormalized)) {
        reason = "Posting scam links.";
        await ban();
        return true;
    };

    // Slurs
    if (slurRegex.test(messageNormalized)) {
        reason = "Using slurs.";
        await msgDelete();
        return true;
    };

    // Ad links
    if (adRegex.test(messageNormalized) && memberRoles.size == 0) {
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
        if (!message.member.kickable) return;
        await message.delete();
        await message.member.kick([`${reason} -${client.user.tag} (${time})`]);
        await message.channel.send({ content: `Successfully auto-kicked **${message.author.tag}** (${message.author.id}) for the following reason: \`${reason}\`` });
        try {
            message.author.send({
                content: `You've been automatically kicked for the following reason: \`${reason}\`\n${messageContentBlock}`
            });
            return true;
        } catch (e) {
            return true;
        };
    };

    async function ban() {
        if (!message.member.bannable) return;
        await message.member.ban({ days: 1, reason: `${reason} -${client.user.tag} (${time})` });
        await message.channel.send({ content: `Successfully auto-banned **${message.author.tag}** (${message.author.id}) for the following reason: \`${reason}\`` });
        try {
            message.author.send({
                content: `You've been automatically banned for the following reason: \`${reason}\`\n${messageContentBlock}`
            });
            return true;
        } catch (e) {
            return true;
        };
    };

    function test() {
        return message.channel.send({ content: `banned lol` });
    };
};