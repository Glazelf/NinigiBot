
const Sequelize = require('sequelize');
const { Users } = require('../database/dbObjects');
exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../events/ready');
    try {
        //items, food, equipment
        const args = message.content.slice(1).trim().split(/ +/);
        const target = message.mentions.users.first() || message.author;
        
        if(args[1]==='items'||args[1]==='food'||args[1]==='equipment'||!args[1]){
            const user = await Users.findOne({ where: { user_id: target.id } });
            
            let items;
            
            if(args[1]==='items'){
                items = await user.getItems();
                if (!items.length) return message.channel.send(`${target.toString()} has no items!`);
                return message.channel.send(`${target.toString()}'s items:\n ${items.map(t => `${t.amount} ${t.item.name}`).join(', ')}`);
            }else if(args[1]==='food'){
                items = await user.getFoods();
                if (!items.length) return message.channel.send(`${target.toString()} has no food!`);
                return message.channel.send(`${target.toString()}'s food:\n ${items.map(t => `${t.amount} ${t.food.name}`).join(', ')}`);
            }else if(args[1]==='equipment'){
                items = await user.getEquipments();
                if (!items.length) return message.channel.send(`${target.toString()} has no equipment!`);
                return message.channel.send(`${target.toString()}'s equipment:\n ${items.map(t => `${t.equipment.name}`).join(', ')}`);
            }else{
                let description = `${target.toString()}'s inventory`
                const length = description.length;
                items = await user.getItems();
                if (items.length) description+=`\n**Items**\n${items.map(t => `${t.amount} ${t.item.name}`)}`
                items = await user.getFoods();
                if (items.length) description+=`\n**Food**\n${items.map(t => `${t.amount} ${t.food.name}`)}`
                items = await user.getEquipments();
                if (items.length) description+=`\n**Equipment**\n${items.map(t => `${t.equipment.name}`)}`
                if(description.length===length) if (!items.length) return message.channel.send(`${target.toString()} has nothing!`);
                return message.channel.send(description);
            }
        }
        return message.channel.send(`> Please specify a possible object: items, food, equipment`);
		
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};

