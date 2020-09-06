exports.run = (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(globalVars.lackPerms);
        if (!message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES")) return message.channel.send(`> I lack the required permissions to delete messages, ${message.author}.`);

        let numberFromMessage = args[0];
        let numberFromMessagestoNumber = Number(numberFromMessage);
        let numberOfMessages = numberFromMessagestoNumber + 1;

        if (isNaN(numberOfMessages)) {
            return message.channel.send(`> Sorry, but "${numberOfMessages}" is not a number, please specify an amount of messages that should be deleted.`);
        };

        if (numberOfMessages > 100) {
            return message.channel.send(`> Sorry, but Discord does not allow more than 100 messages to be deleted at once.`);
        };

        let amount = parseInt(numberOfMessages);

        let user = message.mentions.users.first();

        if (!user) {
            const input = message.content.split(` `, 3);
            let userID = input[2];
            user = client.users.cache.get(userID);
        };

        // Fetch 100 messages (will be filtered and lowered up to max amount requested)
        if (user) {
            message.channel.messages.fetch({
                limit: 100,
            }).then((messages) => {

                const filterBy = user ? user.id : Client.user.id;
                messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);

                message.channel.bulkDelete(messages)
                    .then(message.channel.send(`> ${numberFromMessage} messages from ${user} have been deleted, <@${message.author.id}>.`));
            });

        } else {
            message.channel.messages.fetch({ limit: amount })
                .then(messages => message.channel.bulkDelete(messages))
                .then(message.channel.send(`> ${numberFromMessage} messages have been deleted, ${message.author}.`));
            return;
        };

    } catch (e) {
        // log error
        let { logger } = require('../../events/ready');
        logger(e, message.channel);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};
