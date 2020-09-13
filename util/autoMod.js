module.exports = async (message) => {
    let reason = "Unspecified."
    if (message.content.includes("https://glorysocial.com/profile/")) {
        reason = "Posting scam links.";
        await message.member.ban({ days: 1, reason: reason })
        await message.author.send(`> You've been autobanned for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        return message.channel.send(`> Successfully autobanned ${message.author}.`);
    };

    if(message.content.includes("nigger" || "nigga")) {
        let reason = "Using offensive slurs.";
        await message.delete();
        await message.author.send(`> You've been autokicked for the following reason: \`${reason}\`
\`\`\`${message.content}\`\`\``);
        return message.channel.send(`> Successfully autokicked ${message.author} for the following reason:
\`${reason}\``);
    };
};