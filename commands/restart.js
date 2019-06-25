exports.run = (client, message, args) => {
    // send channel a message that you're resetting bot [optional]
    message.channel.send('Resetting...')
    .then(msg => client.destroy())
    .then(() => client.login(client.config.token));
};
