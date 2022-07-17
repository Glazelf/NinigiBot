const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');

const { Users, ShopTrophy } = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);

module.exports = {
    async getUser(id) {
        let user = await Users.findOne({
            where: { user_id: id },
        });

        if (!user) {
            user = await Users.create({ user_id: id });
        };
        return user;
    },

    async  getShopTrophies() {
        const trophies = await ShopTrophy.findAll();
        return trophies;
    },
    
    async  getShopTrophyWithName(name) {
        let name_t = name.toLowerCase();
        const trophy = await ShopTrophy.findOne(
            {
                where: {
                    [Op.or]: [
                      { trophy_id: name_t },
                      { icon: name_t }
                    ]
                  }
              }
        );
        return trophy;
    },

    async getBuyableShopTrophies(user_id) {
        let user = await this.getUser(user_id)
        const user_trophies = await user.getShopTrophies()
        const user_trophies_list = user_trophies.map(trophy => trophy.trophy_id);
        const trophies = await ShopTrophy.findAll({
            attributes: [
                'trophy_id'
            ],
            where: {
                trophy_id:{
                    [Op.notIn]: user_trophies_list
                },
                price:{
                    [Op.lte]: user.money
                }
            }
        });
        return trophies;
    },
    async buyShopTrophy(user_id, trophy_id) {
        let trophy = await ShopTrophy.findOne({
            where: { trophy_id },
        });
        if (!trophy){
            return 'NoTrophy'
        }
        let user = await Users.findOne({
            where: { user_id },
        });
        if (await user.hasShopTrophy(trophy)){
            return 'HasTrophy'
        }
        if (user.money < trophy.price){
            return 'NoMoney'
        }
        
        await user.addShopTrophy(trophy);
        await user.addMoney(-trophy.price);
        return 'Ok'
    },
};
