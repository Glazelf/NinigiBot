exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const ytdl = require('ytdl-core-discord');
        const Discord = require('discord.js');

        const voiceConnection = await message.member.voice.channel;
        if(!voiceConnection) return message.channel.send(`> You need to be in a voice channel to use music commands, ${message.author}.`);

        voiceConnection.leave();

        return message.channel.send(`> Successfully disconnected, ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
