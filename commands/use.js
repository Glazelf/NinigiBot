exports.run = async (client, message) => {
    try {
        const { Users } = require('../storeObjects');

        const target = message.mentions.users.first() || message.author;
        const userDB = await Users.findOne({ where: { user_id: target.id } });
        const items = await userDB.getItems();
        if(!items) return message.channel.send('You don\'t have any items to use');

        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        const item = items.filter(i => i.item.name.toLowerCase() === commandArgs.toLowerCase());
        if(item.length<1) return message.channel.send('You don\'t have that item.');
        return message.channel.send(item[0].item.use);
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};