const getUserInfoSlice = require('../../util/userinfo/getUserInfoSlice')
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    try {
        const sendMessage = require('../../util/sendMessage');
        const user = interaction.options.getUser("user");
        const msg = await getUserInfoSlice(client, interaction, 0, user.id);
        return sendMessage(msg);
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "userinfo",
    description: "Displays info about a user.",
    options: [{
        name: "user",
        type: "USER",
        description: "Specify user.",
        required: true
    }]
};