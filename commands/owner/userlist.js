module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        let guildID = message.content.slice(10);
        let guild = client.guilds.cache.get(guildID);

        if (!guild) return message.channel.send(`> I couldn't find that server, ${message.author}.`);

        let member = await guild.members.fetch();
        let user = client.users.cache.get(member.id);

        let baseMessage = `> Here's a list of all users for ${guild.name}, ${message.author}:`;

        guild.members.cache.forEach((member) => {
            baseMessage = `${baseMessage}
> ${user.tag} - ${member.id}`;
        });

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
