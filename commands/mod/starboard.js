module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const isAdmin = require('../../util/isAdmin');
        if (!message.member.hasPermission("MANAGE_CHANNELS") && !isAdmin(message.member, client)) return message.reply(globalVars.lackPerms);

        const { StarboardChannels } = require('../../database/dbObjects');
        let oldChannel = await StarboardChannels.findOne({ where: { server_id: message.guild.id } });

        const args = message.content.split(' ');
        let subCommand = args[1];
        if (!subCommand) {
            if (oldChannel) {
                return message.reply(`The current starboard channel is <#${oldChannel.channel_id}>. ${globalVars.starboardLimit} stars are required for a message to appear there.`);
            };
            return message.reply(`Please provide a valid channel or \`disable\`.`);
        };
        subCommand = subCommand.toLowerCase();

        let targetChannel = message.guild.channels.cache.find(channel => channel.name == subCommand);
        if (!targetChannel) targetChannel = message.guild.channels.cache.find(channel => subCommand.includes(channel.id));
        if (!targetChannel && subCommand !== "disable") return message.reply(`That channel does not exist in this server.`);

        if (oldChannel) await oldChannel.destroy();
        if (subCommand == "disable") return message.reply(`Disabled starboard functionality in **${message.guild.name}**.`);

        await StarboardChannels.upsert({ server_id: message.guild.id, channel_id: targetChannel.id });

        return message.reply(`${targetChannel} is now **${message.guild.name}**'s starboard. ${globalVars.starboardLimit} stars are required for a message to appear there.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "starboard",
    aliases: []
};