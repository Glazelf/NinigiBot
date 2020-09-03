const Sequelize = require('sequelize');
const {ne} = Sequelize.Op;
exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        const {  Equipments, Foods, KeyItems, Room, BattleItems } = require('../database/dbObjects');
        const input = message.content.slice(1).trim();
        const [, , biography] = input.match(/(\w+)\s*([\s\S]*)/);
        const condition = {where:{cost:{[ne]:0}}}
        if(biography === 'items'){
            const items = await BattleItems.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        }if(biography === 'equipment'){
            const items = await Equipments.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        }if(biography === 'food'){
            const items = await Foods.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        }if(biography === 'key'){
            const items = await KeyItems.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        }/* if(biography === 'rooms'){
            const items = await Room.findAll(condition);
            return message.channel.send(items.map(i => i.toString()).join('\n'), { code: true });
        } */
        return message.channel.send('That is not a correct shop. Please use `?shop` followed by one of the available shops: items, equipment, food, key');
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};