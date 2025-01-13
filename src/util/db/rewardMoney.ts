import { addMoney } from "../../database/dbServices/user.api.js";
import getBotSubscription from "../discord/getBotSubscription.js";

import globalVars from "../../objects/globalVars.json" with { type: "json"}; import formatName from "../discord/formatName.js";

const subscriberRewardMultiplier = 1.2;

export default async ({
    application,
    userID,
    reward
}: any) => {
    const baseReward = reward;
    let botSubscription = await getBotSubscription(application, userID);
    let isSubscriber = (typeof botSubscription.entitlement !== "undefined"); // Convert to boolean
    if (isSubscriber) reward = Math.floor(reward * subscriberRewardMultiplier);
    await addMoney(userID, reward);
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    let rewardString = `received a bonus ${reward - baseReward}${globalVars.currency} (${subscriberRewardMultiplier * 100 - 100}%) for having ${formatName(botSubscription.SKU.name)}!`;
    return { reward: reward, isSubscriber: isSubscriber, rewardString: rewardString };
};