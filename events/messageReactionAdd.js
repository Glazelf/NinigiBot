module.exports = (reaction, client, message) => {
    try {
        // let guild = client.guilds.cache.get(message.guild.id);

        // if (reaction.emoji.name === "⭐") {
        //     console.log("someone reacted with ⭐⭐⭐⭐⭐")
        // };

        return;

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);
    };
};
