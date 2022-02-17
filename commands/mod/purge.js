exports.run = async (client, interaction, args) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, message.member);
        if (!message.member.permissions.has("MANAGE_MESSAGES") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let numberFromMessage = args[0];

        let numberFromMessagestoNumber = Number(numberFromMessage);
        if (!numberFromMessagestoNumber && args[1]) numberFromMessagestoNumber = Number(args[1]);
        if (!numberFromMessagestoNumber) return sendMessage({ client: client, message: message, content: `Please provide a valid number.` });
        let maxNumberOfMessages = 100;
        let numberOfMessages = numberFromMessagestoNumber + 1;
        if (isNaN(numberOfMessages)) numberFromMessage = args[1];
        if (isNaN(numberOfMessages)) return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid number.` });

        // Max number of messages allowed to be deleted at once
        if (numberOfMessages > maxNumberOfMessages) numberOfMessages = maxNumberOfMessages;

        let amount = parseInt(numberOfMessages);

        // Get user
        let user;
        let userTag;
        let userID;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
            userID = user.id;
            userTag = user.tag;
        };

        if (!user && args[1]) {
            userID = args[1];
            userTag = userID;
        };

        let author = interaction.user;
        let maxMessageFetch = 100;
        if (numberFromMessage > maxMessageFetch) numberFromMessage = maxMessageFetch;

        await message.channel.messages.fetch();

        // Fetch 100 messages (will be filtered and lowered up to max amount requested), delete them and catch errors
        if (userTag && userID) {
            try {
                amount -= 1; // Correct amount
                let messagesAll = await message.channel.messages.fetch({ limit: maxMessageFetch });
                let messagesFiltered = await messagesAll.filter(m => m.author.id == user.id);
                let messages = Object.values(Object.fromEntries(messagesFiltered)).slice(0, amount);

                try {
                    await message.channel.bulkDelete(messages);
                    return message.channel.send({ content: `Deleted ${numberFromMessagestoNumber} messages from ${user.tag}, ${author}.` });
                } catch (e) {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, interaction);
                    } else {
                        // console.log(e);
                        return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` });
                    };
                };
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    // console.log(e);
                    return message.channel.send({ content: `An error occurred while bulk deleting.` });
                };
            };
        } else {
            try {
                let messages = await message.channel.messages.fetch({ limit: amount });
                await message.channel.bulkDelete(messages);
                await message.channel.send({ content: `Deleted ${numberFromMessage} messages, ${author}.\nThis message will be deleted in 10 seconds.`, ephemeral: false }).then(message => {
                    setTimeout(function () {
                        try {
                            message.delete();
                        } catch (e) {
                            // console.log(e);
                        };
                    }, 10000); // delete after 10 seconds
                });
                return;
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, interaction);
                    } else {
                        // console.log(e);
                        return message.channel.send({ content: `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days, ${author}.` });
                    };
                };
            };
        };

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "purge",
    description: "Bulk delete messages.",
    options: [{
        name: "amount",
        type: "INTEGER",
        description: "The amount of messages to delete.",
        required: true
    }]
};