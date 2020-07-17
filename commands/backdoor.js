exports.run = (client, message) => {
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(client.config.lackPerms)
        };

        let guildID = message.content.slice(10);
        let guild = client.guilds.cache.get(guildID);

        if (!guild) {
            let baseMessage = `Since you didn't provide an ID, <@${message.author.id}>, here is a list of serverIDs instead:`
            client.guilds.cache.forEach((guild) => {
                baseMessage = `${baseMessage}
    > -${guild.name}`
            });
        }

        guild.fetchInvites()
            .then(invites => message.channel.send('Found Invites:\n' + invites.map(invite => invite).join('\n')))
            .catch(console.error);

            return;
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: null,
    description: null,
    usage: null
};