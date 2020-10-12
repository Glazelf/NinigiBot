exports.run = async (client, message) => {
    try {
        const ytdl = require('ytdl-core-discord');

        // Prepare play function so that it only requires a voice channel and url as arguments
        const play = async (connection, url) => {
            connection.play(await ytdl(url), {
                type: 'opus',
                filter: 'audioonly',
                quality: 'highestaudio'
            });
        };

        // Read out message arguments
        const args = message.content.split(` `);

        if (!args[1]) return message.channel.send(`> You need to provide a link to play, ${message.author}.`);

        // Get user's voice channel
        const voiceConnection = await message.member.voice.channel;
        if (!voiceConnection) return message.channel.send(`> You need to be in a voice channel to use music commands, ${message.author}.`);

        // Check if input is a valid yt video
        let youtubeLink = args[1].toString();
        if (!youtubeLink.startsWith("https://www.youtube.com/watch?v=") && !youtubeLink.startsWith("https://youtu.be/")) return message.channel.send(`> The text you entered isn't a valid Youtube link, ${message.author}.`);

        // Run play with the provided channel and url
        voiceConnection.join().then(async connection => {
            play(connection, youtubeLink);
            await message.channel.send(`> Now playing <${youtubeLink}> for ${message.author}!`);
        });

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "play",
    aliases: []
};