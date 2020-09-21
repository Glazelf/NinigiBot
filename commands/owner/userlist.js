module.exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (message.author.id !== client.config.ownerID) {
            return message.channel.send(globalVars.lackPerms)
        };

        args = message.content.split(' ');
        let guildID = args[1];
        let guild = client.guilds.cache.get(guildID);
        if (!guild) guild = message.guild;

        let member = await guild.members.fetch();
        let baseMessage = `> Here's a list of all users for ${guild.name}, ${message.author}:`;

        guild.members.cache.forEach((member) => {
            let user = client.users.cache.get(member.id);
            baseMessage = `${baseMessage}
> ${user.tag} - ${member.id} - ${user}`;
        });

        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1997) + "...";

        return message.channel.send(baseMessage);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.names = {
    name: "userlist",
    aliases: ["users"]
};