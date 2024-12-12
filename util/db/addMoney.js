import {
    getMoney,
    addMoney
} from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json";

export default async (reward, userID) => {
    let entitlements = await interaction.client.application.entitlements.fetch({ excludeEnded: true });
    let entitlementsSKU = entitlements.filter(entitlement => entitlement.skuId == globalVars.subscriptionSKUID);

};