module.exports = async (client, role) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { LogChannels } = require('../database/dbObjects');

        let logChannel = await LogChannels.findOne({ where: { server_id: role.guild.id } });
        if (!logChannel) return;
        let log = role.guild.channels.cache.find(channel => channel.id == logChannel.channel_id);
        if (!log) return;

        let botMember = await role.guild.members.fetch(client.user.id);

        if (log.permissionsFor(botMember).has("SEND_MESSAGES") && log.permissionsFor(botMember).has("EMBED_LINKS")) {
            const fetchedLogs = await role.guild.fetchAuditLogs({
                limit: 1,
                type: 'ROLE_CREATE',
            });
            const createLog = fetchedLogs.entries.first();
            let executor;
            if (createLog) {
                const { executor: createExecutor, target } = createLog;
                if (target.id !== role.id) return;
                executor = createExecutor;
            }

            const permissionSerializer = require('../util/permissionBitfieldSerializer');
            const permissions = permissionSerializer(role.permissions);

            // the roleCreated event fires immediately upon clicking the add role button,
            // so the role name will always be the discord default "new role" and the color/permissions will always be the default
            const createEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`Role Created ⭐`)
                .addField(`Role name: `, role.name)
                .addField('Created by: ', `${executor} (${executor.id})`)
                .addField(`Permissions: `, permissions.join(', '))
                .setTimestamp();

            return log.send({ embeds: [createEmbed] });
        } else if (log.permissionsFor(botMember).has("SEND_MESSAGES") && !log.permissionsFor(botMember).has("EMBED_LINKS")) {
            return log.send({ content: `I lack permissions to send embeds in your log channel.` });
        } else {
            return;
        };

    } catch (e) {
        // Log error
        logger(e, client);
    };
};
