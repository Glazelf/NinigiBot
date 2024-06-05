import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import isOwner from "../../util/isOwner.js";

export default async (client, interaction) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

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
        logger(e, client, interaction);
    };
};

export const config = {
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