
const Discord = require('discord.js');

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getUserInfoSlice = require('../../util/userinfo/getUserInfoSlice');
        const user = interaction.options.getUser("user");
        const msg = await getUserInfoSlice(client, interaction, 0, user);
        return sendMessage(msg);
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "Userinfo",
    type: Discord.ApplicationCommandType.User
};