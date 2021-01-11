exports.run = (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_MESSAGES") && message.author.id !== client.config.ownerID) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES")) return message.channel.send(`> I lack the required permissions to delete messages, ${message.author}.`);

        let numberFromMessage = args[0];

        let numberFromMessagestoNumber = Number(numberFromMessage);
        let numberOfMessages = numberFromMessagestoNumber + 1;
        if (isNaN(numberOfMessages)) numberFromMessage = args[1];
        if (isNaN(numberOfMessages)) return message.channel.send(`> Please provide a valid number, ${message.author}.`);

        if (numberOfMessages > 100) numberOfMessages = 100;

        let amount = parseInt(numberOfMessages);

        let user = message.mentions.users.first();

        if (!user) {
            let userID = args[1];
            user = client.users.cache.get(userID);
            if (!user) {
                userID = input[0];
                user = client.users.cache.get(userID);
            };
        };

        // Fetch 100 messages (will be filtered and lowered up to max amount requested)
        if (user) {
            message.channel.messages.fetch({
                limit: 100,
            }).then((messages) => {
                const filterBy = user ? user.id : Client.user.id;
                messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);

                message.channel.bulkDelete(messages)
                    .then(message.channel.send(`> ${numberFromMessage} messages from ${user.tag} have been deleted, ${message.author}.`));
            });

        } else {
            message.channel.messages.fetch({ limit: amount })
                .then(messages => message.channel.bulkDelete(messages))
                .then(message.channel.send(`> ${numberFromMessage} messages have been deleted, ${message.author}.`));
            return;
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "purge",
    aliases: ["clear"]
};