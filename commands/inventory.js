exports.run = async (client, message) => {
    try {
        const { Users } = require('../storeObjects');
        const target = message.mentions.users.first() || message.author;
        const user = await Users.findOne({ where: { user_id: target.id } });
        const items = await user.getItems();

        if (!items.length) return message.channel.send(`${target.toString()} has nothing!`);
        return message.channel.send(`${target.toString()} currently has ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};
