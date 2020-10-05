module.exports = async (message) => {
    if (message.member.hasPermission("KICK_MEMBERS")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    let messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    messageNormalized = messageNormalized.toLowerCase();

    const scamLinks = [
        "https://glorysocial.com/profile/"
    ];
    const offensiveSlurs = [
        "nigger",
        "niqqer",
        "nigga",
        "niqqa",
        "nlgger",
        "nlgga",
        //"retard",
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
    if (scamLinks.some(v => messageNormalized.includes(v)) &&
        message.member.bannable && memberRoles.size == 0) {
        reason = "Posting scam links.";
        ban();
    };

    // Offensive slurs
    if (offensiveSlurs.some(v => messageNormalized.includes(v)) &&
        !exceptions.some(v => messageNormalized.includes(v)) &&
        message.member.kickable) {
        reason = "Using offensive slurs.";
        kick();
    };

    // Test 
    // if(testArray.some(v => messageNormalized.includes(v))){
    //     test()
    // };

    async function kick() {
        await message.delete();
        await message.member.kick([reason]);
        await message.channel.send(`> Successfully autokicked ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\``);
        try {
            return message.author.send(`> You've been autokicked for the following reason: \`${reason}\`
        \`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    async function ban() {
        await message.member.ban({ days: 1, reason: reason });
        await message.channel.send(`> Successfully autobanned ${message.author.tag} (${message.author.id}) for the following reason: \`${reason}\``);
        try {
            return message.author.send(`> You've been autobanned for the following reason: \`${reason}\`
            \`\`\`${message.content}\`\`\``);
        } catch (e) {
            return;
        };
    };

    function test() {
        return message.channel.send(`banned lol`);
    };

    // if (testArray.some(v => messageNormalized.includes(v))) return message.channel.send("banned lol");
};