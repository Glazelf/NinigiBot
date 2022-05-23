exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let interactionName = interaction.options.getString("interaction-name");
        let interaction = client.application.commands.find(element => element.name == interactionName);
        if (!interaction) return sendMessage({ client: client, interaction: interaction, content: `Interaction \`${interactionName}\` not found.`, });
        await client.application.commands.delete(interaction.id);
        return sendMessage({ client: client, interaction: interaction, content: `Deleted interaction \`${interactionName}\`.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "removeinteraction",
    description: "Remove an interaction.",
    serverID: ["759344085420605471"],
    options: [{
        name: "interaction-name",
        type: "BOOLEAN",
        description: "Interaction to remove.",
        required: true
    }]
};