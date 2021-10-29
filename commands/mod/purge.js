exports.run = async (client, message, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_MESSAGES") && !adminBool) return sendMessage(client, message, globalVars.lackPerms);

        let numberFromMessage = args[0];

        let numberFromMessagestoNumber = Number(numberFromMessage);
        let maxNumberOfMessages = 100;
        let numberOfMessages = numberFromMessagestoNumber + 1;
        if (isNaN(numberOfMessages)) numberFromMessage = args[1];
        if (isNaN(numberOfMessages)) return sendMessage(client, message, `Please provide a valid number.`);

        // Max number of messages allowed to be deleted at once
        if (numberOfMessages > maxNumberOfMessages) numberOfMessages = maxNumberOfMessages;

        let amount = parseInt(numberOfMessages);

        // Get user
        let user;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
        };

        if (!user && args[1]) {
            let userID = args[1];
            user = await client.users.fetch(userID);
        };

        let author = message.member.user;

        await message.channel.messages.fetch();

        // Fetch 100 messages (will be filtered and lowered up to max amount requested), delete them and catch errors
        if (user) {
            try {
                let maxMessageFetch = 100;
                let messages = await message.channel.messages.fetch({ limit: maxMessageFetch });
                messages = await messages.filter(m => m.author.id == user.id).array().slice(0, amount);
                try {
                    await message.channel.bulkDelete(messages);
                    await message.channel.send({ content: `Deleted ${numberFromMessage} messages from ${user.tag}, ${author}.` });
                } catch (e) {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, message);
                    } else {
                        return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` });
                    };
                };
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    return message.channel.send({ content: `An error occurred while bulk deleting.` });
                };
            };
        } else {
            try {
                let messages = await message.channel.messages.fetch({ limit: amount });
                await message.channel.bulkDelete(messages);
                await message.channel.send({ content: `Deleted ${numberFromMessage} messages, ${author}.` });
                return;
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, message);
                } else {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, message);
                    } else {
                        return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` });
                    };
                };
            };
        };

    } catch (e) {
        // Log error
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