module.exports = async (message) => {
    // Import globals
    let globalVars = require('../events/ready');

    if (message.content.includes("https://glorysocial.com/profile/")) {
        await message.member.ban({ days: 1, reason: message.content })
        return message.channel.send(`> Successfully autobanned ${message.author}.`);
    };
};