exports.run = (client, message, args) => {
    if (!message.author.id===client.config.ownerID){
        return message.channel.send("You aren't allowed to restart this bot because you do not own it.")
      }
    // send channel a message that you're resetting bot [optional]
    message.channel.send('Resetting...')
    .then(msg => client.destroy())
    .then(() => client.login(client.config.token));
};
