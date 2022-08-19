exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        switch (interaction.options.getSubcommand()) {
            case "sim":
                const sendMessage = require('../../util/sendMessage');
                let replyText = `Ninigi Virtual Simulation Wiki: [here](<https://github.com/Glazelf/NinigiBot/wiki/Virtual-Simulation>)`;
                return sendMessage({ client: client, interaction: interaction, content: replyText, ephemeral:false });
        };
    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "wiki",
    description: `Shortcut to Ninigi wiki.`,
    options: [{
        name: "sim",
        type: "SUB_COMMAND",
        description: "Shortcut to Ninigi Virtual Simulation features!"
    }]
};