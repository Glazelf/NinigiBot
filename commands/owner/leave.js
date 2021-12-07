exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        let devServer = await client.guilds.fetch(globalVars.botServerID);
        let devChannel = await devServer.channels.fetch(globalVars.botChannelID);

        await message.guild.leave();

        return devChannel.send({ content: `Left **${message.guild.name}**.` });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "leave",
    aliases: [],
    description: "Leaves the server."
};