import { SKUType } from "discord.js";

export default async (application: any, userID: any) => {
    // There is no way to compare subscription "tiers"; this would need to be hardcoded
    let SKUs = await application.fetchSKUs();
    let entitlements = await application.entitlements.fetch({ excludeEnded: true });
    let entitlementSKU = null;
    let botSubscription = entitlements.find((entitlement: any) => {
        entitlementSKU = SKUs.get(entitlement.skuId);
        if (entitlementSKU.type == SKUType.Subscription && entitlement.userId == userID) return entitlement;
    });
    return { entitlement: botSubscription, SKU: entitlementSKU };
};