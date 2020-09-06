exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { Users } = require('../../database/dbObjects');

        const target = message.mentions.users.first() || message.author;
        const userDB = await Users.findOne({ where: { user_id: target.id } });
        const items = await userDB.getItems();
        if (!items) return message.channel.send(`> You don't have any items to use, ${message.author}.`);

        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const item = items.filter(i => i.item.name.toLowerCase() === commandArgs.toLowerCase());
        if (item.length < 1) return message.channel.send(`> You don't have that item, ${message.author}.`);
        return message.channel.send(item[0].item.use);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};
