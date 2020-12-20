module.exports = async (message) => {
    const { ModEnabledServers } = require('../database/dbObjects');
    const dbServers = await ModEnabledServers.findAll();
    const servers = dbServers.map(server => server.server_id);

    if (!servers.includes(message.guild.id)) return;
    if (message.member.hasPermission("KICK_MEMBERS")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "").toLowerCase();

    const scamLinks = [
        "https://glorysocial.com/profile/"
    ];
    const adLinks = [
        "discord.gg",
        "bit.ly",
        "twitch.tv"
    ];
    const offensiveSlurs = [
        "nigger",
        "niqqer",
        "nigga",
        "niqqa",
        "nlgger",
        "nlgga",
        "nibba",
        "retard",
        "faggot",
        "tranny"
    ];
    const exceptions = [
        "retardation" // thanks mom
    ];
    const testArray = [
        "triceratops"
    ];

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

    // Offensive slurs
    if (offensiveSlurs.some(v => messageNormalized.includes(v)) &&
        !exceptions.some(v => messageNormalized.includes(v))) {
        reason = "Using offensive slurs.";
        msgDelete();
    };

    // Test
    // if (testArray.some(v => messageNormalized.includes(v))) {
    //     test();
    // };

    async function msgDelete() {
        if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) return;
        await message.delete();
        return message.channel.send(`> Deleted a message by ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\``);
    };

    async function kick() {
        if (!message.member.kickable) return;
        await message.delete();
        await message.member.kick([reason]);
        await message.channel.send(`> Successfully auto-kicked ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\``);
        try {
            return message.author.send(`> You've been automatically kicked for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    async function ban() {
        if (!message.member.bannable) return;
        await message.member.ban({ days: 1, reason: reason });
        await message.channel.send(`> Successfully auto-banned ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\``);
        try {
            return message.author.send(`> You've been automatically banned for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    function test() {
        return message.channel.send(`banned lol`);
    };
};