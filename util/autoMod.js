module.exports = async (message) => {
    const Discord = require("discord.js");
    const { ModEnabledServers } = require('../database/dbObjects');
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    if (!servers.includes(message.guild.id)) return;
    if (message.member.permissions.has("MANAGE_MESSAGES")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let isSlur = false;
    let messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\W/g, '').replace(" ", "").toLowerCase();
    let messageContentBlock = "";
    if (message.content.length > 0) messageContentBlock = Discord.Formatters.codeBlock(message.content);

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
        await ban();
        return true;
    };

    // Ad links
    if (adLinks.some(v => messageNormalized.includes(v)) && memberRoles.size == 0) {
        reason = "Advertisement.";
        await msgDelete();
        return true;
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
        await msgDelete();
        return true;
    };

    // Test
    // if (testArray.some(v => messageNormalized.includes(v))) {
    //     test();
    // };

    async function msgDelete() {
        if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return;
        await message.delete();
        return message.channel.send({ content: `Deleted a message by ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\`` });
        // return true;
    };

    async function kick() {
        if (!message.member.kickable) return;
        await message.delete();
        await message.member.kick([reason]);
        await message.channel.send({ content: `Successfully auto-kicked ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\`` });
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
        await message.member.ban({ days: 1, reason: reason });
        await message.channel.send({ content: `Successfully auto-banned ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\`` });
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