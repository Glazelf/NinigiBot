module.exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(globalVars.lackPerms);

        const { VCTextChannels } = require('../../database/dbObjects');
        let oldChannel = await VCTextChannels.findOne({ where: { server_id: message.guild.id } });

        const args = message.content.split(' ');
        let subCommand = args[1];
        if (!subCommand) {
            if (oldChannel) {
                return message.channel.send(`> The current VC text channel is <#${oldChannel.channel_id}>, ${message.author}. ${globalVars.starboardLimit}.`);
            };
            return message.channel.send(`> Please provide a valid channel or \`disable\`, ${message.author}.`);
        };
        subCommand = subCommand.toLowerCase();

        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return message.channel.send(`> That channel does not exist in this server, ${message.author}.`);

        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return message.channel.send(`> Disabled VC text channel functionality in **${message.guild.name}**, ${message.author}.`);

        await VCTextChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return message.channel.send(`> ${targetChannel} is now **${message.guild.name}**'s VC text channel, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "vctextchannel",
    aliases: ["vtc", "voicetext", "vcchannel"]
};