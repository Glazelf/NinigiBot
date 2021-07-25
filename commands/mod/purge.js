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

        if (!user && args[1]) {
            let userID = args[1];
            user = await client.users.cache.get(userID);
        };

        let author;
        if (message.type == 'DEFAULT') {
            author = message.author;
        } else {
            author = message.member.user;
        };

        await message.channel.messages.fetch();

        // Fetch 100 messages (will be filtered and lowered up to max amount requested)
        if (user) {
            try {
                let maxMessageFetch = 100;
                let messages = await message.channel.messages.fetch({ limit: maxMessageFetch });
                messages = await messages.filter(m => m.author.id == user.id).array().slice(0, amount);
                try {
                    await message.channel.bulkDelete(messages);
                    await message.channel.send({ content: `Deleted ${numberFromMessage} messages from ${user.tag}, ${author}.` });
                } catch (e) {
                    return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` })
                };
            } catch (e) {
                return message.channel.send({ content: `An error occurred while bulk deleting.` });
            };
        } else {
            try {
                let messages = await message.channel.messages.fetch({ limit: amount });
                await message.channel.bulkDelete(messages);
                await message.channel.send({ content: `Deleted ${numberFromMessage} messages, ${author}.` });
                return;
            } catch (e) {
                return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` });
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