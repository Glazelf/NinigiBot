const talkedRecently = new Set();

module.exports = async (client, message) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const sendMessage = require('../util/sendMessage');
        const Discord = require("discord.js");
        const autoMod = require('../util/autoMod');
        const api_user = require('../database/dbServices/user.api');

        if (!message || !message.author) return;
        if (message.author.bot || message.author.system) return;

        let messageImage = null;
        if (message.attachments.size > 0) {
            messageImage = message.attachments.first().url;
        };

        // Ignore commands in DMs
        if (message.channel.type == "DM" || !message.guild) {
            // Send message contents to dm channel
            let DMChannel = await client.channels.fetch(client.config.devChannelID);
            let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);

            let profileButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${message.author.id}` }));

            const dmEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `DM Message` })
                .setThumbnail(avatar)
                .addField(`Author:`, message.author.tag, false)
            if (message.content) dmEmbed.addField(`Message content:`, message.content, false);
            dmEmbed
                .setImage(messageImage)
                .setTimestamp();

            let dmLogObject = { content: message.author.id, embeds: [dmEmbed], components: [profileButtons] };

            return DMChannel.send(dmLogObject);
        };

        if (!message.channel.type == "GUILD_FORUM" && !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

        // Automod
        let modBool = false;
        if (message.type != 'APPLICATION_COMMAND') modBool = await autoMod(client, message);
        if (modBool) return;

        let memberRoles = 0;
        if (message.member.roles) memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone").size;

        // Add currency
        if (message.content && message.member) {
            if (!talkedRecently.has(message.member.id) && memberRoles > 0) {
                
                api_user.addMoney(message.member.id, 1);
                talkedRecently.add(message.member.id);
                setTimeout(() => {
                    if (message.member) talkedRecently.delete(message.member.id);
                }, 60000);
            };
        };
        return;

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};