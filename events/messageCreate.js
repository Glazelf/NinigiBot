const talkedRecently = new Set();

module.exports = async (client, message) => {
    const logger = require('../util/logger');
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
        let prefix;
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
        if (message.channel.type == "DM" || !message.guild) {
            if (message.author.bot) return;

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
                .setFooter(message.author.tag)
                .setTimestamp();

            let dmLogObject = { content: message.author.id, embeds: [dmEmbed], components: [profileButtons] };

            if (message.content.indexOf(prefix) == 0) {
                try {
                    sendMessage(client, message, `Sorry, you're not allowed to use commands in private messages!`);
                } catch (e) {
                    return DMChannel.send(dmLogObject);
                };
            };
            return DMChannel.send(dmLogObject);
        };

        if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

        // Ignore all bots and welcome messages
        if (!message.member) return;
        if (message.author.bot == true) return;

        // Automod
        let modBool = false;
        if (message.type != 'APPLICATION_COMMAND') modBool = await autoMod(client, message);
        if (modBool) return;

        let memberRoles = message.member.roles.cache.filter(element => element.name !== "@everyone");

        // Add currency if message doesn't start with prefix
        if (message.content && message.member) {
            if (message.content.indexOf(prefix) !== 0 && !talkedRecently.has(message.member.id) && memberRoles.size !== 0) {
                bank.currency.add(message.member.id, 1);
                talkedRecently.add(message.member.id);
                setTimeout(() => {
                    if (message.member) talkedRecently.delete(message.member.id);
                }, 60000);
            };
        };

        // Ignore messages not starting with the prefix
        if (message.content.indexOf(prefix) !== 0) return;

        // Ignore messages that are just prefix
        if (message.content === prefix) return;

        // Ignore messages that start with prefix double or prefix space
        if (secondCharacter == prefix || secondCharacter == ` `) return;

        let args;
        let commandName = "";
        // Standard definition
        if (message.content) {
            args = message.content.slice(prefix.length).trim().split(/ +/g);
            commandName = args.shift().toLowerCase();
        };

        // Grab the command data from the client.commands Enmap
        let cmd;
        // Slower? command checker, since some commands user capitalization
        await client.commands.forEach(command => {
            if (command.config.name.toLowerCase() == commandName) cmd = client.commands.get(commandName);
        });
        if (!cmd) {
            if (client.aliases.has(commandName)) cmd = client.commands.get(client.aliases.get(commandName));
        };

        // Probably faster command checker, but fails when command uses capitalization (i.e. context menu)
        // if (client.commands.has(commandName)) {
        //     cmd = client.commands.get(commandName);
        // } else if (client.aliases.has(commandName)) {
        //     cmd = client.commands.get(client.aliases.get(commandName));
        // } else return;

        if (message.deleted) return;

        // Run the command
        if (cmd) {
            // Ignore messages sent in a disabled channel
            if (channels.includes(message.channel.id) && !message.member.permissions.has("MANAGE_CHANNELS")) return sendMessage(client, message, `Commands have been disabled in this channel.`);

            try {
                await message.channel.sendTyping();
            } catch (e) {
                // console.log(e);
            };

            await cmd.run(client, message, args);
        } else return;

        return;

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};
