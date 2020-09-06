exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const { Users, Equipments, Foods, KeyItems, Room, CurrencyShop } = require('../../database/dbObjects');
        const { Op } = require('sequelize');
        const shops = [Equipments, Foods, KeyItems, CurrencyShop];
        const input = message.content.slice(1).trim();
        const [, , commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);
        for (let i = 0; i < shops.length; i++) {
            const item = await shops[i].findOne({ where: { name: { [Op.like]: commandArgs } } });
            if (item) {
                if (item.cost === 0) return message.channel.send(`> That item doesn't exist, ${message.author}.`);
                if (item.cost > bank.currency.getBalance(message.author.id)) {
                    return message.channel.send(`> You don't have enough currency, ${message.author}.
> The ${item.name} costs ${item.cost}💰 but you only have ${Math.floor(bank.currency.getBalance(message.author.id))}💰.`);
                };
                const user = await Users.findOne({ where: { user_id: message.author.id } });

                bank.currency.add(message.author.id, -item.cost);
                if (i === 0) {
                    await user.addEquipment(item);

                } else if (i === 1) {
                    await user.addFood(item);

                } else if (i === 2) {
                    await user.addKey(item);

                } else if (i === 3) {
                    await user.addItem(item);
                }/* else{
                    await user.changeRoom(item);
                    
                } */

                return message.channel.send(`> You've bought a ${item.name}, ${message.author}.`);

            };
        };
        return message.channel.send(`> That item doesn't exist, ${message.author}.`);

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};