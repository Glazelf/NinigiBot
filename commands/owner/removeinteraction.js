const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });

        let interactionName = interaction.options.getString("interaction-name");
        let guildID = interaction.options.getString("guild-id");

        let commands = await client.application.commands.fetch();
        let command = commands.find(c => c.name === interactionName);
        if (!command) return sendMessage({ client: client, interaction: interaction, content: `Command \`${interactionName}\` not found.` });

        try {
            await client.application.commands.delete(command.id, guildID);
        } catch (e) {
            // console.log();
            return sendMessage({ client: client, interaction: interaction, content: `Failed to delete \`${interactionName}\`.` });
        };
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
        type: Discord.ApplicationCommandOptionType.String,
        description: "Interaction to remove.",
        required: true
    }, {
        name: "guild-id",
        type: Discord.ApplicationCommandOptionType.String,
        description: "ID of guild."
    }]
};