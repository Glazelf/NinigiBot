module.exports = async (message) => {
    if (message.member.hasPermission("KICK_MEMBERS")) return;
    if (!message.content) return;

    let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

    let reason = "Unspecified.";
    messageNormalized = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const scamLinks = ["https://glorysocial.com/profile/"];
    const offensiveSlurs = ["nigger", "nigga", "niqqa"];
    // const testArray = ["triceratops"];

    if (message.member.bannable && memberRoles.size == 0) {
        if (scamLinks.some(v => messageNormalized.includes(v))) {
            reason = "Posting scam links.";
            await message.member.ban({ days: 1, reason: reason })
            await message.author.send(`> You've been autobanned for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
            return message.channel.send(`> Successfully autobanned ${message.author} for the following reason: \`${reason}\``);
        };
    };

    if (message.member.kickable && offensiveSlurs.some(v => messageNormalized.includes(v))) {
        reason = "Using offensive slurs.";
        await message.delete();
        await message.member.kick([reason]);
        await message.author.send(`> You've been autokicked for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        return message.channel.send(`> Successfully autokicked ${message.author} for the following reason: \`${reason}\``);
    };

    // if (testArray.some(v => messageNormalized.includes(v))) return message.channel.send("banned lol");
};