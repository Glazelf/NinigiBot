import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    ephemeral = true;
    let SKUs = await interaction.client.application.fetchSKUs();
    let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });

    const entitlementEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle("SKUs & Entitlements");

    for await (let [SKUID, SKU] of SKUs) {
        let userList = [];
        let entitlementsSKU = entitlements.filter(entitlement => entitlement.skuId == SKU.id);
        if (entitlementsSKU.length < 1) continue;
        for await (let [entitlementID, entitlement] of (entitlementsSKU)) {
            let entitlementUser = await entitlement.fetchUser();
            userList.push(`${entitlementUser.username} (${entitlementUser.id})`);
        };
        if (userList.length > 0) entitlementEmbed.addFields([{ name: SKU.name, value: userList.join("\n") }]);
    };

    return sendMessage({ interaction: interaction, embeds: entitlementEmbed, ephemeral: ephemeral });
};

export const guildID = config.devServerID;

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