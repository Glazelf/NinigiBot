module.exports = async (client, messages) => {
    const logger = require('../util/logger');
    try {
        if (!messages) return;
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbServices/server.api');
        // Find a good way to check executor for this sometime
        let messagesContent = "";
        let guild = null;
        messages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp); // Convert collection to array and order it chronologically
        for await (const message of messages) {
            if (!guild) guild = message.guildId;
            // Currently starboarded messages that get purged aren't removed from starboard as this would require a silly amount of database calls
            if (message.content) {
                messagesContent += `${message.author}: ${message.content}\n`;
            } else {
                messagesContent += `Message from ${message.author} without text.`;
            };
        };
        if (messagesContent.length < 1) return;
        guild = await client.guilds.fetch(guild);
        if (!guild) return;
        // Get log
        let logChannel = await LogChannels.findOne({ where: { server_id: guild.id } });
        if (!logChannel) return;
        let log = guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = guild.members.me;
        if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
            if (messagesContent.length > 1024) messagesContent = `...${messagesContent.substring(messagesContent.length - 1021, messagesContent.length)}`;
            if (messagesContent.length < 1) return;

            const purgeEmbed = new Discord.EmbedBuilder()
                .setColor(client.globalVars.embedColor)
                .setTitle(`Messages Purged ❌`)
                .setDescription(messagesContent)
                .setFooter({ text: `Messages purged: ${messages.length}` });
            return log.send({ embeds: [purgeEmbed] });
        } else if (log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.SendMessages) && !log.permissionsFor(botMember).has(Discord.PermissionFlagsBits.EmbedLinks)) {
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
        // Log error
        logger(e, client);
    };
};
