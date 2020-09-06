module.exports = (client, error) => {
    // log error
    console.log(error);

    // log to dev channel
    let baseMessage = `A connection error occurred!
\`\`\`
${error}
\`\`\``;
    if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
    let devChannel = client.channels.cache.get(client.config.devChannelID);
    devChannel.send(baseMessage);
};