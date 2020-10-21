exports.run = async (client, message) => {
    try {
        // Disable music commands for now because they're a buggy mess I don't feel like patching up
        return message.channel.send(`> Music commands have currently been disabled, ${message.author}.`);
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

module.exports.config = {
    name: "stop",
    aliases: []
};