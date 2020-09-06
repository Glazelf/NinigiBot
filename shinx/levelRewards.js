let rewards = new Map([
    [2, 'Fried Seedot'],
    [4, 'Purple poffin'],
    [6, 'Fried Seedot'],
    [100, 'Shiny Charm'],
]);

const { Users, Equipments, Foods, KeyItems, Room } = require('../database/dbObjects');
const shops = [Equipments, Foods, KeyItems];

module.exports = async (shinxBattle, increasedLevels) => {
    let userRewards = []
    for(let i = shinxBattle.level-increasedLevels; i <=shinxBattle.level;i++){
        const reward = rewards.get(i);
        if (reward) {
            for (let i = 0; i < shops.length; i++) {
                const item = await shops[i].findOne({ where: { name: reward } });
                if (item) {
                    const user = await Users.findOne({ where: { user_id: shinxBattle.owner.id } });
                    if (i === 0) {
                        await user.addEquipment(item);
                        userRewards.push(['equipment', reward]) ;
                    } else if (i === 1) {
                        await user.addFood(item);
                        userRewards.push(['food', reward]);
                    } else if (i === 2) {
                        await user.addKey(item);
                        userRewards.push(['key item', reward]);
                    } else if (i === 3) {
                        await user.changeRoom(item);
                        userRewards.push(['room', reward]);
                    };
                };
            };
        };
    }
    return userRewards;
};
