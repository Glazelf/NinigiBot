exports.run = (client, message) => {
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

        guild.fetchInvites()
            .then(invites => message.channel.send(`> ${message.author}, I found the following invites:\n` + invites.map(invite => invite).join(`\n`)))
            .catch(console.error);
        return;

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "invitelist",
    aliases: ["invites"]
};