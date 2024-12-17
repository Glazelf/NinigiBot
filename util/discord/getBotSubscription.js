import { SKUType } from "discord.js";

export default async (interaction, userID) => {
    // There is no way to compare subscription "tiers"; this would need to be hardcoded
    let SKUs = await interaction.client.application.fetchSKUs();
    let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });
    let entitlementSKU = null;
    let botSubscription = entitlements.find(entitlement => {
        entitlementSKU = SKUs.find(SKU => SKU.id == entitlement.skuId);
        if (entitlementSKU.type == SKUType.Subscription && entitlement.userId == userID) return entitlement;
    });
    return { entitlement: botSubscription, SKU: entitlementSKU };
};