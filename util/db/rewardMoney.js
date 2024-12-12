import { addMoney } from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json"}; import formatName from "../discord/formatName.js";
;

const subscriberRewardMultiplier = 1.2;

export default async ({ interaction, userID, reward }) => {
    const baseReward = reward;
    let SKUs = await interaction.client.application.fetchSKUs();
    let rewardSKU = SKUs.find(SKU => SKU.id == globalVars.subscriptionSKUID); // SKU id for testing goes here
    if (!rewardSKU) return { reward: reward, isSubscriber: false };
    let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });
    let entitlementsSKU = entitlements.filter(entitlement => entitlement.skuId == rewardSKU.id); // rewardSKU.id should === globalVars.subscriptionSKUID
    let isSubscriber = false;
    for await (let [entitlementID, entitlement] of (entitlementsSKU)) {
        let entitlementUser = await entitlement.fetchUser();
        if (entitlementUser.id == userID) isSubscriber = true;
    };
    if (isSubscriber) reward = Math.floor(reward * subscriberRewardMultiplier);
    addMoney(userID, reward);
    let rewardString = `received a bonus ${reward - baseReward}${globalVars.currency} (${subscriberRewardMultiplier * 100 - 100}%) for having ${formatName(rewardSKU.name)}!`;
    return { reward: reward, isSubscriber: isSubscriber, rewardString: rewardString };
};