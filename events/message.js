const talkedRecently = new Set();

module.exports = async (client, message) => {
    // Import globals
    let globalVars = require('./ready');
    try {
        const Discord = require("discord.js");
        const { bank } = require('../database/bank');
        const sendMessage = require('../util/sendMessage');
        let secondCharacter = message.content.charAt(1);

        const { DisabledChannels, Prefixes } = require('../database/dbObjects');
        const dbChannels = await DisabledChannels.findAll();
        const channels = dbChannels.map(channel => channel.channel_id);
        let prefix = false;
        if (message.guild) prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        const autoMod = require('../util/autoMod');

        // Call image
        let messageImage = null;
        if (message.attachments.size > 0) {
            messageImage = message.attachments.first().url;
        };

        // Ignore commands in DMs
        if (message.channel.type == "dm" || !message.guild) {
            if (message.author.bot) return;
            if (message.content.indexOf(prefix) == 0) {
                sendMessage(client, message, `Sorry, you're not allowed to use commands in private messages!`);
            };
            // Send message contents to dm channel
            let DMChannel = client.channels.cache.get(client.config.devChannelID);
            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });
            const dmEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`DM Message`, avatar)
                .setThumbnail(avatar)
                .addField(`Author:`, message.author.tag, false)
                .addField(`Author ID:`, message.author.id, false);
            if (message.content) dmEmbed.addField(`Message content:`, message.content, false);
            dmEmbed
                .setImage(messageImage)
                .setFooter(client.user.tag)
                .setTimestamp();
            return DMChannel.send(dmEmbed);
        };

        if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

        // Ignore all bots and welcome messages
        if (message.author.bot) return;
        if (!message.member) return;

        // Automod
        autoMod(message);

        let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

        // Add currency if message doesn't start with prefix
        if (message.content.indexOf(prefix) !== 0 && !talkedRecently.has(message.author.id) && memberRoles.size !== 0) {
            bank.currency.add(message.author.id, 1);
            talkedRecently.add(message.author.id);
            setTimeout(() => {
                talkedRecently.delete(message.author.id);
            }, 60000);
        };

        // Ignore messages not starting with the prefix
        if (message.content.indexOf(prefix) !== 0) return;

        // Ignore messages that are just prefix
        if (message.content === prefix) return;

        // Ignore messages that start with prefix double or prefix space
        if (secondCharacter == prefix || secondCharacter == ` `) return;

        // Standard definition
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        // Grab the command data from the client.commands Enmap
        let cmd;
        if (client.commands.has(commandName)) {
            cmd = client.commands.get(commandName);
        } else if (client.aliases.has(commandName)) {
            cmd = client.commands.get(client.aliases.get(commandName));
        } else return;

        // Ignore messages sent in a disabled channel
        if (channels.includes(message.channel.id) && !message.member.permissions.has("MANAGE_CHANNELS")) return sendMessage(client, message, `Commands have been disabled in this channel.`);

        // Run the command
        if (cmd) {
            message.channel.startTyping();
            await cmd.run(client, message, args);
            message.channel.stopTyping(true);
        } else return;

        return;

    } catch (e) {
        // log error
        const logger = require('../util/logger');

        logger(e, client, message);
    };
};
