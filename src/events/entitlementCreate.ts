import {
    EmbedBuilder
} from "discord.js";
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";

import globalVars from "../objects/globalVars.json";

export default async (client: any, entitlement: any) => {
    try {
        let user = await client.users.fetch(entitlement.userId);
        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log) return;

        let SKUs = client.application.fetchSKUs();
        let matchingSKU = SKUs.get(entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor as ColorResolvable)
            .setTitle("Entitlemend Started ⭐")
            .setDescription(`${user.username} (${user.id})'s ${formatName(matchingSKU.name)} started.`)
            .setFooter({ text: entitlement.id })
            .setTimestamp();
        return log.send({ embeds: [entitlementEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};
