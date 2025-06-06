import {
    EmbedBuilder
} from "discord.js";
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, entitlement) => {
    try {
        let user = await client.users.fetch(entitlement.userId);
        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log) return;

        let SKUs = await client.application.fetchSKUs();
        let matchingSKU = SKUs.find(SKU => SKU.id == entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle("Entitlemend Started ⭐")
            .setDescription(`${user.username} (${user.id})'s ${formatName(matchingSKU.name, true)} started.`)
            .setFooter({ text: `ID: ${entitlement.id}` })
            .setTimestamp();
        return log.send({ embeds: [entitlementEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};
