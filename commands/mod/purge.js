exports.run = async (client, message, args) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(message.member, client);
        if (!message.member.permissions.has("MANAGE_MESSAGES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let numberFromMessage = args[0];

        let numberFromMessagestoNumber = Number(numberFromMessage);
        let numberOfMessages = numberFromMessagestoNumber + 1;
        if (isNaN(numberOfMessages)) numberFromMessage = args[1];
        if (isNaN(numberOfMessages)) return sendMessage(client, message, `Please provide a valid number.`);

        if (numberOfMessages > 100) numberOfMessages = 100;

        let amount = parseInt(numberOfMessages);

        let user;
        if (message.mentions) {
            user = message.mentions.users.first();
        };

        if (!user) {
            let userID = args[1];
            user = client.users.cache.get(userID);
            if (!user) {
                userID = args[0];
                user = client.users.cache.get(userID);
            };
        };

        await message.channel.messages.fetch();

        // Fetch 100 messages (will be filtered and lowered up to max amount requested)
        if (user) {
            message.channel.messages.fetch({
                limit: 100,
            }).then((messages) => {
                const filterBy = user.id;
                messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);

                message.channel.bulkDelete(messages)
                    .then(message.channel.send({ content: `Deleted ${numberFromMessage} messages from ${user.tag}, ${message.member}.` }));
            });

        } else {
            try {
                message.channel.messages.fetch({ limit: amount })
                    .then(messages => message.channel.bulkDelete(messages));
                await message.channel.send({ content: `Deleted ${numberFromMessage} messages, ${message.member}.` });
                return;
            } catch (e) {
                return message.channel.send({ content: `An error occurred while bulk deleting, you are likely trying to bulk delete messages older than 14 days.` });
            };
        };

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "purge",
    aliases: ["clear"],
    description: "Bulk delete messages.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "The amount of messages to delete."
    }]
};