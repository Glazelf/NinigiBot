module.exports = async (message) => {
    // if (message.member.hasPermission("KICK_MEMBERS")) return;
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
        "retard",
        "faggot",
        "tranny"
    ];
    const testArray = ["triceratops"];

    // Scam links
    if (scamLinks.some(v => messageNormalized.includes(v)) && message.member.bannable && memberRoles.size == 0) {
        reason = "Posting scam links.";
        ban();
    };

    // Offensive slurs
    if (offensiveSlurs.some(v => messageNormalized.includes(v)) && message.member.kickable) {
        reason = "Using offensive slurs.";
        kick();
    };

    // Test 
    // if(testArray.some(v => messageNormalized.includes(v))){
    //     test()
    // };

    function kick() {
        message.delete();
        message.member.kick([reason]);
        message.author.send(`> You've been autokicked for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        return message.channel.send(`> Successfully autokicked ${message.author} for the following reason: \`${reason}\``);
    };

    function ban() {
        message.member.ban({ days: 1, reason: reason });
        message.author.send(`> You've been autobanned for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        return message.channel.send(`> Successfully autobanned ${message.author} for the following reason: \`${reason}\``);
    };

    function test(){
        return message.channel.send(`banned lol`);
    };

    // if (testArray.some(v => messageNormalized.includes(v))) return message.channel.send("banned lol");
};