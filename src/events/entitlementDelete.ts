import {
    EmbedBuilder,
    PermissionFlagsBits,
    TextChannel
} from "discord.js";
import type { ExtendedClient } from '../types/global.js';
import logger from "../util/logger.js";
import deletePersonalRole from "../util/db/deletePersonalRole.js";
import formatName from "../util/discord/formatName.js";
import checkPermissions from "../util/discord/perms/checkPermissions.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: ExtendedClient, entitlement) => {
    try {
        let serverApi: any = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default() as any;

        let guild = await client.guilds.fetch(globalVars.ShinxServerID);
        if (!guild) return;
        let user = await client.users.fetch(entitlement.userId);
        let member = await guild.members.fetch(entitlement.userId);
        if (!member) return;
        let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: guild.id, user_id: entitlement.userId } });
        if (!member.premiumSince && roleDB && !checkPermissions({ member: member, permissions: [PermissionFlagsBits.ManageRoles] })) await deletePersonalRole(roleDB, guild);

        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log || !log.isTextBased()) return;

        let SKUs = await client.application.fetchSKUs();
        let matchingSKU = SKUs.find(SKU => SKU.id == entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor as [number, number, number])
            .setTitle("Entitlemend Ended ❌")
            .setDescription(`${user.username} (${user.id})'s ${formatName(matchingSKU.name, true)} ended.`)
            .setFooter({ text: `ID: ${entitlement.id}` })
            .setTimestamp();
        return (log as TextChannel).send({ embeds: [entitlementEmbed] });

    } catch (e: any) {
        logger({ exception: e, client: client });
    };
};
