exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        let adminBool = await isAdmin(client, interaction.member);
        if (!interaction.member.permissions.has("MANAGE_MESSAGES") && !adminBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let amount = args.find(element => element.name == "amount").value;
        let maxNumberOfMessages = 100;
        if (amount > maxNumberOfMessages) amount = maxNumberOfMessages;
        if (amount < 1) return sendMessage({ client: client, interaction: interaction, content: `Please provide a valid number.` });

        // Get users
        let user = null;
        let author = interaction.user;
        let userArg = args.find(element => element.name == "user");
        if (userArg) user = userArg.user;

        let oldMessagesString = `An error occurred while bulk deleting. You are likely trying to bulk delete messages older than 14 days.`;

        // Fetch 100 messages (will be filtered and lowered up to max amount requested), delete them and catch errors
        if (user) {
            try {
                let messagesAll = await interaction.channel.messages.fetch({ limit: maxNumberOfMessages });
                let messagesFiltered = await messagesAll.filter(m => m.author.id == user.id);
                let messages = Object.values(Object.fromEntries(messagesFiltered)).slice(0, amount);

                console.log(messages)

                try {
                    await interaction.channel.bulkDelete(messages);
                    return sendMessage({ client: client, interaction: interaction, content: `Deleted ${amount} messages from ${user.tag} within the last ${maxNumberOfMessages} messages.` });
                } catch (e) {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, interaction);
                    } else {
                        // console.log(e);
                        return sendMessage({ client: client, interaction: interaction, content: oldMessagesString });
                    };
                };
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    // console.log(e);
                    return sendMessage({ client: client, interaction: interaction, content: `An error occurred while bulk deleting.` });
                };
            };
        } else {
            try {
                let messages = await interaction.channel.messages.fetch({ limit: amount });
                await interaction.channel.bulkDelete(messages);
                return sendMessage({ client: client, interaction: interaction, content: `Deleted ${amount} messages` });
            } catch (e) {
                if (e.toString().includes("Missing Permissions")) {
                    return logger(e, client, interaction);
                } else {
                    if (e.toString().includes("Missing Permissions")) {
                        return logger(e, client, interaction);
                    } else {
                        // console.log(e);
                        return interaction.channel.send({ content: oldMessagesString });
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
    }, {
        name: "user",
        type: "USER",
        description: "The user to delete messages from."
    }]
};