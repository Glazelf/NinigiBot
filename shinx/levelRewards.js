let rewards = new Map([
    //[2, 'Fried seedot'],
    [100, 'Shiny charm'],
]);

const { Users, Equipments, Foods, KeyItems, Room, BattleItems } = require('../database/dbObjects');
const shops = [Equipments, Foods, KeyItems, Room, BattleItems]

module.exports = async (shinxBattle) => {
    const reward = rewards.get(shinxBattle.level)
    if(!reward) return
    for(let i=0; i < shops.length; i++){
        const item = await shops[i].findOne({ where: { name: reward } });
        if (item) {
            const user = await Users.findOne({ where: { user_id: shinxBattle.owner.id } });
            if(i===0){
                await user.addEquipment(item);
                return ['equipment', reward]
            }else if(i===1){
                await user.addFood(item);
                return ['food', reward]
            }else if(i===2){
                await user.addKey(item);
                return ['key item', reward]
            }else if(i===3){
                await user.changeRoom(item);
                return ['room', reward]
            }else{
                await user.addItem(item);
                return ['item', reward]
            }
        }
    }   
};
