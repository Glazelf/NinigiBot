import { addMoney } from "../../database/dbServices/user.api.js";
import getBotSubscription from "../discord/getBotSubscription.js";
import globalVars from "../../objects/globalVars.json" with { type: "json"}; import formatName from "../discord/formatName.js";

const subscriberRewardMultiplier = 1.2;

export default async ({ interaction, userID, reward }) => {
    const baseReward = reward;
    const failMessageObject = { reward: reward, isSubscriber: false };
    let SKUs = await interaction.client.application.fetchSKUs();
    let botSubscription = await getBotSubscription(interaction, userID);
    if (!botSubscription) return failMessageObject;
    let rewardSKU = SKUs.find(SKU => SKU.id == botSubscription.skuId);
    reward = Math.floor(reward * subscriberRewardMultiplier);
    addMoney(userID, reward);
    let rewardString = `received a bonus ${reward - baseReward}${globalVars.currency} (${subscriberRewardMultiplier * 100 - 100}%) for having ${formatName(rewardSKU.name)}!`;
    return { reward: reward, isSubscriber: true, rewardString: rewardString };
};