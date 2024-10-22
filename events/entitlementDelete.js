import {
    EmbedBuilder,
    bold
} from "discord.js";
import logger from "../util/logger.js";
import deletePersonalRole from "../util/deletePersonalRole.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, entitlement) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();


        let guild = await client.guilds.fetch(globalVars.ShinxServerID);
        if (!guild) return;
        let user = await client.users.fetch(entitlement.userId);
        let member = await guild.members.fetch(entitlement.userId);
        if (!member) return;
        let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: guild.id, user_id: entitlement.userId } });
        if (!member.premiumSince && roleDB && member.permissions && !member.permissions.has(PermissionFlagsBits.ManageRoles)) await deletePersonalRole(roleDB, guild);

        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log) return;

        let SKUs = await client.application.fetchSKUs();
        let matchingSKU = Object.entries(SKUs).find(SKU => SKU.id == entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor)
            .setTitle("Entitlemend Ended ❌")
            .setDescription(`${user.username} (${user.id})'s ${bold(matchingSKU.name)} ended.`)
            .setFooter({ text: entitlement.id })
            .setTimestamp();
        return log.send({ embeds: [entitlementEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};
