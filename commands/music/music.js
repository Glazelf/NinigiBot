exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const ytdl = require('ytdl-core');
        const input = message.content.split(` `);
        let subCommand = input[1].toLowerCase();
        if (!subCommand) return message.channel.send(`> You need to provide a valid argument, ${message.author}. The options are: play, skip and stop.`);
        const queue = new Map();
        const serverQueue = queue.get(message.guild.id);
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) return message.channel.send(`> You need to be in a voice channel to use music commands, ${message.author}.`);

        switch (subCommand) {
            case "play":
                execute(message, serverQueue);
                break;
            case "skip":
                skip(message, serverQueue);
                break;
            case "stop":
                stop(message, serverQueue);
                break;
            default:
                return message.channel.send(`> You need to provide a valid argument, ${message.author}. The options are: play, skip and stop.`);
        };

        async function execute(message, serverQueue) {
            const voiceChannel = message.member.voice.channel;
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.channel.send(`> I need the permissions to join and speak in your voice channel, ${message.author}.`);
            };

            const songInfo = await ytdl.getInfo(input[2]);
            const song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };

            if (!serverQueue) {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };

                queue.set(message.guild.id, queueContruct);
                queueContruct.songs.push(song);

                try {
                    var connection = await voiceChannel.join();
                    queueContruct.connection = connection;
                    play(message.guild, queueContruct.songs[0]);
                } catch (err) {
                    console.log(err);
                    queue.delete(message.guild.id);
                };
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(`> ${song.title} has been added to the queue, ${message.author}!`);
            };
        };

        function skip(message, serverQueue) {
            if (!serverQueue) return message.channel.send(`> There is no song to skip, ${message.author}.`);
            serverQueue.connection.dispatcher.end();
        };

        function stop() {
            voiceChannel.leave();
            if (serverQueue) serverQueue.songs = [];
            return message.channel.send(`> Music has been stopped, ${message.author}.`);
        };

        function play(guild, song) {
            const serverQueue = queue.get(guild.id);
            if (!song) {
                serverQueue.voiceChannel.leave();
                queue.delete(guild.id);
                return;
            };

            const dispatcher = serverQueue.connection.play(ytdl(song.url), { quality: 'highestaudio', highWaterMark: 1 << 25 })
                .on("finish", () => {
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                })
                .on("error", error => console.error(error));
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Start playing: **${song.title}**.
Requested by: ${message.author}.`);
        };

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};
