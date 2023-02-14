
exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    try {
        const sendMessage = require('../../util/sendMessage');
        let ephemeral = true;
        let res, returnString;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        let master = interaction.user;
        foodArg = interaction.options.getInteger("food");
        const userApi = require('../../database/dbServices/user.api');
        res = await userApi.buyFood(master.id, foodArg);
        returnString = res ? `Added ${foodArg}🍗 to your account!` : `Not enough money!`;
        return sendMessage({
            client: client,
            interaction: interaction,
            content: returnString,
            ephemeral: ephemeral || res != true
        });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "buyfood",
    description: "Buy food for shinx",
    options: [{
        name: "food",
        type: "INTEGER",
        description: "The amount of food you want to buy.",
        required: true,
    }]
};