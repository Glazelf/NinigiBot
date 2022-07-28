const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const {userdata} =  require('../dbConnection/dbConnection');

const { User, ShopTrophy } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

const DAILY_TROPHIES = 5;

module.exports = {
    async getUser(id) {
        let user = await User.findOne({
            where: { user_id: id },
        });

        if (!user) {
            user = await User.create({ user_id: id });
        };
        return user;
    },

    async  getShopTrophies() {
        const trophies = await ShopTrophy.findAll();
        return trophies;
    },

    async  getTodayShopTrophies() {
        const d = new Date();
        
        const trophies = await ShopTrophy.findAll();
        let index = (d.getDate() + d.getFullYear() ) % trophies.length;
        const today_trophies = []
        const today_indexes = []
        for (let i = 0; i < DAILY_TROPHIES; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%trophies.length);
            }
            today_trophies.push(trophies[index])
            today_indexes.push(index)
            index = (index+DAILY_TROPHIES)%trophies.length
        }
        return today_trophies;
    },

    async  getTodayShopTrophiesToBuy(money) {
        const d = new Date();
        
        const trophies = await ShopTrophy.findAll({attributes: [
            'trophy_id', 'price'
        ]});
        let index = (d.getDate() + d.getFullYear()) % trophies.length;
        let today_trophies = []
        const today_indexes = []
        for (let i = 0; i < DAILY_TROPHIES; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%trophies.length);
            }
            today_trophies.push(trophies[index])
            today_indexes.push(index)
            index = (index+DAILY_TROPHIES)%trophies.length
        }
        today_trophies = today_trophies.filter(trophy => trophy.price <= money)
        trophies_ids = today_trophies.map(trophy=> trophy.trophy_id)
        return trophies_ids;
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

        let today_trophies = await this.getTodayShopTrophiesToBuy(user.money);
        today_trophies = today_trophies.filter(trophy => !(trophy in user_trophies_list))
        return today_trophies
    },

    async getFullBuyableShopTrophies(user_id) {        
        let user = await this.getUser(user_id)
        const user_trophies = await user.getShopTrophies()
        const user_trophies_list = user_trophies.map(trophy => trophy.trophy_id);

        let today_trophies = await this.getTodayShopTrophies();
        today_trophies.forEach(trophy => {
            // can't buy, can buy, bought
            if(user_trophies_list.includes(trophy.trophy_id)){
                trophy.temp_bought = 'Bought'
            } else {
                trophy.temp_bought = trophy.price > user.money? 'CantBuy' : 'CanBuy'
            }
        })
        return today_trophies
    },

    async buyShopTrophy(user_id, trophy_id) {
        const trophies = await this.getTodayShopTrophies();
        let trophy = trophies.find(elem => elem.trophy_id == trophy_id);
        if (!trophy){
            return 'NoTrophy'
        }
        let user = await this.getUser(user_id);
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
