import {
    EmbedBuilder,
    TextChannel
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";
import formatName from "../util/discord/formatName.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient, entitlement) => {
    try {
        let user = await client.users.fetch(entitlement.userId);
        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log || !log.isTextBased()) return;

        let SKUs = await client.application.fetchSKUs();
        let matchingSKU = SKUs.find(SKU => SKU.id == entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor as [number, number, number])
            .setTitle("Entitlemend Started ⭐")
            .setDescription(`${user.username} (${user.id})'s ${formatName(matchingSKU.name, true)} started.`)
            .setFooter({ text: `ID: ${entitlement.id}` })
            .setTimestamp();
        return (log as TextChannel).send({ embeds: [entitlementEmbed.toJSON()] });

    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};
