module.exports = async (client, message, language) => {
    const getLanguageString = require('./getLanguageString');
    const Discord = require("discord.js");
    const { ModEnabledServers } = require('../database/dbObjects');
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    if (!servers.includes(message.guild.id)) return;
    if (!message.member) return;
    if (message.member.permissions.has("MANAGE_MESSAGES")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W/g, '').replace(" ", "").toLowerCase();
    let messageContentBlock = "";
    if (message.content.length > 0) messageContentBlock = Discord.Formatters.codeBlock(message.content);

    const scamLinks = [
        ".*http(.)?:\/\/(dicsord-nitro|steamnitro|discordgift|discorcl)\.(com|org|ru|click).*", // Discord gift links
        ".*http(.)?:\/\/[^\s]*\.ru.*" // Russian websites, should disable this for russian discords lol
    ];
    let scamRegex = new RegExp(scamLinks.join("|"), "i");

    const adLinks = [
        "discord.gg",
        "bit.ly",
        "twitch.tv"
    ];
    let adRegex = new RegExp(adLinks.join("|"), "i");

    const globalSlurs = [
        "(n|i){1,32}(l|e){0,32}((g{2,32}|q){1,32}|[gqb]{2,32}|[g]{1,32})([er]{1,32}|[e3ra]{1,32})", // Variations of the n-word
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
        if (language = "fr") {
            if (exceptionsFrenchRegex.test(messageNormalized)) return false;
        };
        if (language = "es") {
            if (exceptionsSpanishRegex.test(messageNormalized)) return false;
        };
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

        let autoModDeletedMessage = await getLanguageString(client, language, 'autoModDeletedMessage');
        autoModDeletedMessage = autoModDeletedMessage.replace('[userTag]', `**${message.author.tag}**`).replace('[userID]', `(${message.author.id})`).replace('[reason]', `\`${reason}\``);

        return message.channel.send({ content: autoModDeletedMessage });
        // return true;
    };

    async function kick() {
        if (!message.member.kickable) return;
        await message.delete();
        await message.member.kick([reason]);

        let autoModKickedReturn = await getLanguageString(client, language, 'autoModKickedReturn');
        autoModKickedReturn = autoModKickedReturn.replace('[userTag]', `**${message.author.tag}**`).replace('[userID]', `(${message.author.id})`).replace('[reason]', `\`${reason}\``);
        let autoModKickedDM = await getLanguageString(client, language, 'autoModKickedDM');
        autoModKickedDM = autoModKickedDM.replace('[reason]', `\`${reason}\``) + `\n${messageContentBlock}`;

        await message.channel.send({ content: autoModKickedReturn });
        try {
            message.author.send({ content: autoModKickedDM });
            return true;
        } catch (e) {
            // console.log(e);
            return true;
        };
    };

    async function ban() {
        if (!message.member.bannable) return;

        let autoModBannedReturn = await getLanguageString(client, language, 'autoModBannedReturn');
        autoModBannedReturn = autoModBannedReturn.replace('[userTag]', `**${message.author.tag}**`).replace('[userID]', `(${message.author.id})`).replace('[reason]', `\`${reason}\``);
        let autoModBannedDM = await getLanguageString(client, language, 'autoModBannedDM');
        autoModBannedDM = autoModBannedDM.replace('[reason]', `\`${reason}\``) + `\n${messageContentBlock}`;

        await message.channel.send({ content: autoModBannedReturn });
        try {
            message.author.send({ content: autoModBannedDM });
        } catch (e) {
            // console.log(e);
        };
        await message.member.ban({ days: 1, reason: reason });
        return true;
    };

    function test() {
        return message.channel.send({ content: `banned lol` });
    };
};