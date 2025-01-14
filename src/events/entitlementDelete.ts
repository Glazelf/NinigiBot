import {
    EmbedBuilder
} from "discord.js";
import logger from "../util/logger.js";
import deletePersonalRole from "../util/db/deletePersonalRole.js";
import formatName from "../util/discord/formatName.js";

import globalVars from "../objects/globalVars.json";

export default async (client: any, entitlement: any) => {
    try {
        let serverApi = await import("../database/dbServices/server.api.js");
        // @ts-expect-error TS(2741): Property 'default' is missing in type '{ shinxQuot... Remove this comment to see the full error message
        serverApi = await serverApi.default();

        let guild = await client.guilds.fetch(globalVars.ShinxServerID);
        if (!guild) return;
        let user = await client.users.fetch(entitlement.userId);
        let member = await guild.members.fetch(entitlement.userId);
        if (!member) return;
        // @ts-expect-error TS(2339): Property 'PersonalRoles' does not exist on type 't... Remove this comment to see the full error message
        let roleDB = await serverApi.PersonalRoles.findOne({ where: { server_id: guild.id, user_id: entitlement.userId } });
        // @ts-expect-error TS(2304): Cannot find name 'PermissionFlagsBits'.
        if (!member.premiumSince && roleDB && member.permissions && !member.permissions.has(PermissionFlagsBits.ManageRoles)) await deletePersonalRole(roleDB, guild);

        if (!user) return;
        let log = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
        if (!log) return;

        let SKUs = await client.application.fetchSKUs();
        let matchingSKU = SKUs.find(entitlement.skuId);
        if (!matchingSKU) return;

        const entitlementEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor as ColorResolvable)
            .setTitle("Entitlemend Ended ❌")
            .setDescription(`${user.username} (${user.id})'s ${formatName(matchingSKU.name)} ended.`)
            .setFooter({ text: entitlement.id })
            .setTimestamp();
        return log.send({ embeds: [entitlementEmbed] });

    } catch (e) {
        logger({ exception: e, client: client });
    };
};
