exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const ytdl = require('ytdl-core-discord');
        const Discord = require('discord.js');

        const play = async (connection, url) => {
            connection.play(await ytdl(url), {
                type: 'opus',
                filter: 'audioonly',
                quality: 'highestaudio'
            });
        };

        const input = message.content.split(` `);

        const voiceConnection = await message.member.voice.channel;
        if (!voiceConnection) return message.channel.send(`> You need to be in a voice channel to use music commands, ${message.author}.`);

        voiceConnection.join().then(async connection => {
            play(connection, input[1].toString());
            await message.channel.send(`> Now playing for ${message.author}!`);
        });

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

