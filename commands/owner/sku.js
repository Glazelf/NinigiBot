import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (client, interaction, ephemeral) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPermsString });

        ephemeral = true;

        let SKUs = await client.application.fetchSKUs();
        console.log(client.application.entitlements)
        let subscriberList = "";
        return sendMessage({ client: client, interaction: interaction, content: Object.entries(SKUs).toString(), ephemeral: ephemeral });

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const guildIDs = [config.devServerID];

// Subcommands
const infoSubcommand = new SlashCommandSubcommandBuilder()
    .setName("info")
    .setDescription("See info.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("sku")
    .setDescription("Interact with SKUs.")
    .setDMPermission(false)
    .addSubcommand(infoSubcommand);