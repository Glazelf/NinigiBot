const getUserInfoSlice = require('../../util/userinfo/getUserInfoSlice')
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    try {
        return getUserInfoSlice(client, interaction, 0);
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