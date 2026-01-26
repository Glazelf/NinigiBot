import { addMoney } from "../../database/dbServices/user.api.js";
import getBotSubscription from "../discord/getBotSubscription.js";
import globalVars from "../../objects/globalVars.json" with { type: "json"}; import formatName from "../discord/formatName.js";

const subscriberRewardMultiplier = 1.2;

export default async ({ application, userID, reward }) => {
    const baseReward = reward;
    let botSubscription = await getBotSubscription(application, userID);
    let isSubscriber = (typeof botSubscription.entitlement !== "undefined"); // Convert to boolean
    if (isSubscriber) reward = Math.floor(reward * subscriberRewardMultiplier);
    await addMoney(userID, reward);
    let rewardString = `received a bonus ${subscriberRewardMultiplier * 100 - 100}% (${reward - baseReward}${globalVars.currency}) for having ${formatName(botSubscription.SKU.name, true)}!`;
    return { reward: reward, isSubscriber: isSubscriber, rewardString: rewardString };
};