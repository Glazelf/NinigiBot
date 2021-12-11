exports.run = async (client, message) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');

        let adminBool = await isAdmin(client, message.member);
        if (message.guild.id !== "861884184787550218" || !adminBool) return;

        return sendMessage(client, message, returnString);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "emulator",
    aliases: ["emu"],
    description: "Interact with GB emulator."
};