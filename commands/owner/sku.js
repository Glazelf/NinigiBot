import {
    InteractionContextType,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    time,
    TimestampStyles
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

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
            let entitlementStartsAt = Math.floor(entitlement.startsTimestamp / 1000);
            userList.push(`${entitlementUser.username} (${entitlementUser.id}) ${time(entitlementStartsAt, TimestampStyles.ShortDateTime)}`);
        };
        if (userList.length > 0) entitlementEmbed.addFields([{ name: SKU.name, value: userList.join("\n") }]);
    };

    return sendMessage({ interaction: interaction, embeds: entitlementEmbed, ephemeral: ephemeral });
};

export const guildID = process.env.DEV_SERVER_ID;

// Subcommands
const infoSubcommand = new SlashCommandSubcommandBuilder()
    .setName("info")
    .setDescription("See info.");
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("sku")
    .setDescription("Interact with SKUs.")
    .setContexts([InteractionContextType.Guild])
    .addSubcommand(infoSubcommand);