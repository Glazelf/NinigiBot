import Discord from "discord.js";
import logger from "../../util/logger";
import sendMessage from "../../util/sendMessage";
import api_user from "../../database/dbServices/user.api";

export default async (client, interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let dbBalance = await api_user.getMoney(interaction.user.id);
        return sendMessage({ client: client, interaction: interaction, content: `You have ${Math.floor(dbBalance)}${client.globalVars.currency}.`, ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "balance",
    description: "Sends how much money you have.",
    options: [{
        name: "ephemeral",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Whether the reply will be private."
    }]
};