module.exports = async (message) => {
    const { ModEnabledServers } = require('../database/dbObjects');
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    const LanguageDetect = require('languagedetect');
    const lngDetector = new LanguageDetect();

    if (!servers.includes(message.guild.id)) return;
    if (message.member.permissions.has("MANAGE_MESSAGES")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let isSlur = false;
    let messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "").toLowerCase();

    const scamLinks = [
        "https://glorysocial.com/profile/"
    ];
    const adLinks = [
        "discord.gg",
        "bit.ly",
        "twitch.tv"
    ];
    const globalSlurs = [
        "nigger",
        "niqqer",
        "nigga",
        "niqqa",
        "nlgger",
        "nlgga",
        "nibba",
        "neger", // Thanks Ewok
        "fag",
        "faggot",
        "tranny",
        "retard" // french
    ];
    // const frenchSlurs = [
    //     "retard"
    // ];
    const exceptions = [
        "retardation" // Thanks Pokémom
    ];
    const testArray = [
        "triceratops"
    ];

    // if (globalSlurs.some(v => messageNormalized.includes(v)) || frenchSlurs.some(v => messageNormalized.includes(v))) isSlur = true;
    if (globalSlurs.some(v => messageNormalized.includes(v))) isSlur = true;

    // Scam links
    if (scamLinks.some(v => messageNormalized.includes(v)) && memberRoles.size == 0) {
        reason = "Posting scam links.";
        ban();
    };

    // Ad links
    if (adLinks.some(v => messageNormalized.includes(v)) && memberRoles.size == 0) {
        reason = "Advertisement.";
        msgDelete();
    };

    // Slurs
    if (isSlur && !exceptions.some(v => messageNormalized.includes(v))) {
        // Currently checks for top 1 language(s) only, can be changed based on effectiveness
        // let detectedLanguages = lngDetector.detect(message.content, 1);
        // languageArray = detectedLanguages.map(function (x) {
        //     return x[0];
        // });

        // if (frenchSlurs.some(v => messageNormalized.includes(v)) && languageArray.indexOf("french") > -1) return;
        reason = "Using slurs.";
        msgDelete();
    };

    // Test
    // if (testArray.some(v => messageNormalized.includes(v))) {
    //     test();
    // };

    async function msgDelete() {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return;
        await message.delete();
        return message.channel.send(`> Deleted a message by ${message.member.user.tag} (${message.member.id}) for the following reason: \`${reason}\``);
    };

    async function kick() {
        if (!message.member.kickable) return;
        await message.delete();
        await message.member.kick([reason]);
        await message.channel.send(`> Successfully auto-kicked ${message.member.user.tag} (${message.member.id}) for the following reason: \`${reason}\``);
        try {
            return message.member.user.send(`> You've been automatically kicked for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    async function ban() {
        if (!message.member.bannable) return;
        await message.member.ban({ days: 1, reason: reason });
        await message.channel.send(`> Successfully auto-banned ${message.member.user.tag} (${message.member.id}) for the following reason: \`${reason}\``);
        try {
            return message.member.user.send(`> You've been automatically banned for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    function test() {
        return message.channel.send(`banned lol`);
    };
};