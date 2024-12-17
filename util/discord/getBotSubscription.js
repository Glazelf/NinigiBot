import globalVars from "../../objects/globalVars.json"  with { type: "json" };
export default async (interaction, userID) => {
    let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });
    let botSubscription = entitlements.find(entitlement => entitlement.skuId == globalVars.subscriptionSKUID && entitlement.userId == userID);
    return botSubscription;
};