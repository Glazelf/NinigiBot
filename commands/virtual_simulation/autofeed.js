const shinxApi = require('../../database/dbServices/shinx.api');
const autofeed_modes =
    [
        {
            "name": "No auto mode",
            "value": 0
        },
        {
            "name": "Feed automatically",
            "value": 1
        },
        {
            "name": "Feed automatically, buy more food if needed.",
            "value": 2
        }
    ];

exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    try {
        const sendMessage = require('../../util/sendMessage');
        let ephemeral = true;
        let returnString;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        let emotesAllowed = true;
        if (ephemeralArg === false) ephemeral = false;
        if (ephemeral == true && !interaction.guild.roles.everyone.permissions.has("USE_EXTERNAL_EMOJIS")) emotesAllowed = false;
        let master = interaction.user;
        let mode_num = interaction.options.getInteger("mode");
        let res = await shinxApi.changeAutoFeed(master.id, mode_num);
        let mode_str = autofeed_modes[mode_num].name;
        returnString = res ? `Changed autofeed to: ${mode_str}` : `Autofeed already set to: ${mode_str}`;
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
    name: "autofeed",
    description: "Automatize the feeding process of Shinx",
    options: [{
        name: "mode",
        type: "INTEGER",
        description: "Mode you want to set",
        required: true,
        choices: autofeed_modes
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether this command is only visible to you."
    }]
};