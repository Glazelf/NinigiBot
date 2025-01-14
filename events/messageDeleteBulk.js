import {
    EmbedBuilder,
    PermissionFlagsBits
} from "discord.js";
import logger from "../util/logger.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client, messages) => {
    try {
        if (!messages) return;
        // Find a good way to check executor for this sometime
        let messagesContent = "";
        let guild = null;
        messages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp); // Convert collection to array and order it chronologically
        for await (const message of messages) {
            // Currently starboarded messages that get purged aren't removed from starboard as this would require a silly amount of database calls
            if (!guild) guild = message.guildId;
            let addString = `${message.author}:`;
            if (message.content) addString += ` ${message.content}\n`;
            if (messagesContent.length + addString.length > 1024) {
                break;
            } else {
                messagesContent += addString;
            };
        };
        if (messagesContent.length < 1) return;
        guild = await client.guilds.fetch(guild);
        if (!guild) return;
        // Get log
        let serverApi = await import("../database/dbServices/server.api.js");
        serverApi = await serverApi.default();
        let logChannel = await serverApi.LogChannels.findOne({ where: { server_id: guild.id } });
        if (!logChannel) return;
        let log = guild.channels.cache.get(logChannel.channel_id);
        if (!log) return;

        let botMember = guild.members.me;
        if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            if (messagesContent.length > 1024) messagesContent = `...${messagesContent.substring(messagesContent.length - 1021, messagesContent.length)}`;
            if (messagesContent.length < 1) return;

            const purgeEmbed = new EmbedBuilder()
                .setColor(globalVars.embedColor)
                .setTitle(`Messages Purged ❌`)
                .setDescription(messagesContent)
                .setFooter({ text: `Messages purged: ${messages.length}` });
            return log.send({ embeds: [purgeEmbed] });
        } else if (log.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(PermissionFlagsBits.EmbedLinks)) {
            try {
                return log.send({ content: `I lack permissions to send embeds in ${log}.` });
            } catch (e) {
                // console.log(e);
                return;
            };
        } else {
            return;
        };

    } catch (e) {
        logger({ exception: e, client: client });
    };
};
