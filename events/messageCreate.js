const talkedRecently = new Set();

module.exports = async (client, message) => {
    const logger = require('../util/logger');
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { bank } = require('../database/bank');
        const sendMessage = require('../util/sendMessage');

        const autoMod = require('../util/autoMod');

        if (message.author.bot) return;

        // Call image
        let messageImage = null;
        if (message.attachments.size > 0) {
            messageImage = message.attachments.first().url;
        };

        // Ignore commands in DMs
        if (message.channel.type == "DM" || !message.guild) {
            // Send message contents to dm channel
            let DMChannel = await client.channels.fetch(client.config.devChannelID);
            let avatar = message.author.displayAvatarURL(globalVars.displayAvatarSettings);

            // Buttons
            let profileButtons = new Discord.MessageActionRow()
                .addComponents(new Discord.MessageButton({ label: 'Profile', style: 'LINK', url: `discord://-/users/${message.author.id}` }));

            const dmEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor({ name: `DM Message`, iconURL: avatar })
                .setThumbnail(avatar)
                .addField(`Author:`, `${message.author} (${message.author.id})`, false)
            if (message.content) dmEmbed.addField(`Message content:`, message.content, false);
            dmEmbed
                .setImage(messageImage)
                .setFooter({ text: message.author.tag });

            let dmLogObject = { content: message.author.id, embeds: [dmEmbed], components: [profileButtons] };

            return DMChannel.send(dmLogObject);
        };

        if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;


        // Automod
        let modBool = false;
        if (message.type != 'APPLICATION_COMMAND') modBool = await autoMod(client, message);
        if (modBool) return;

        let messageMember = message.guild.members.fetch(message.author.id);
        let memberRoles = messageMember.roles.cache.filter(element => element.name !== "@everyone");

        // Add currency
        if (message.content && messageMember) {
            if (!talkedRecently.has(messageMember.id) && memberRoles.size !== 0) {
                bank.currency.add(messageMember.id, 1);
                talkedRecently.add(messageMember.id);
                setTimeout(() => {
                    if (messageMember) talkedRecently.delete(messageMember.id);
                }, 60000);
            };
        };
        return;

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};
