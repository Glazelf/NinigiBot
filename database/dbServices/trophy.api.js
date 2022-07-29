const Sequelize = require('sequelize');
const { Op, fn, where, col } = require('sequelize');
const {userdata} =  require('../dbConnection/dbConnection');

const { User, ShopTrophy, EventTrophy } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

const DAILY_TROPHIES = 5;


module.exports = {
    async getUser(id, attributes=null) {
        let user = await User.findByPk(param=id, options={
            
            attributes:attributes
        });

        if (!user) {
            user = await User.create({ user_id: id });
        };
        return user;
    },
    async getTrophySlice(offset, trophies_per_page){
        
        let EventTrophys = await EventTrophy.findall({attributes: ['trophy_id', 'icon']});
        let shoptrophies = await ShopTrophy.findall({attributes: ['trophy_id', 'icon']});
        let trophies = EventTrophys.concat(shoptrophies);
        let up_range = Math.min(offset + trophies_per_page, trophies.length);
        let answer = 'LR';
        if(up_range==trophies.length){
            answer == 'L';
        } else if (offset==0){
            answer == 'R';
        }
        return {slice : trophies.slice(offset, offset+trophies_per_page), buttons: answer}
    },
    async  getShopTrophys() {
        const trophies = await ShopTrophy.findAll();
        return trophies;
    },

    async  getTodayShopTrophys() {
        const d = new Date();
        
        const trophies = await ShopTrophy.findAll();
        let index = (d.getDate() + d.getFullYear() ) % trophies.length;
        const today_trophies = []
        const today_indexes = []
        for (let i = 0; i < DAILY_TROPHIES  ; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%trophies.length);
            }
            today_trophies.push(trophies[index])
            today_indexes.push(index)
            index = (index+DAILY_TROPHY)%trophies.length
        }
        return today_trophies;
    },

    async  getTodayShopTrophysToBuy(money) {
        const d = new Date();
        
        const trophies = await ShopTrophy.findAll({attributes: [
            'trophy_id', 'price'
        ]});
        let index = (d.getDate() + d.getFullYear()) % trophies.length;
        let today_trophies = []
        const today_indexes = []
        for (let i = 0; i < DAILY_TROPHIES  ; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%trophies.length);
            }
            today_trophies.push(trophies[index])
            today_indexes.push(index)
            index = (index+DAILY_TROPHY)%trophies.length
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
                        where(fn('lower', col('trophy_id')), name_t),
                      { icon: name_t }
                    ]
                  }
              }
        );
        return trophy;
    },

    async getBuyableShopTrophys(user_id) {        
        let user = await this.getUser(user_id)
        const user_trophies = await user.getShopTrophys()
        const user_trophies_list = user_trophies.map(trophy => trophy.trophy_id);

        let today_trophies = await this.getTodayShopTrophysToBuy(user.money);
        today_trophies = today_trophies.filter(trophy => !(trophy in user_trophies_list))
        return today_trophies
    },

    async getFullBuyableShopTrophys(user_id) {        
        let user = await this.getUser(user_id)
        const user_trophies = await user.getShopTrophys()
        const user_trophies_list = user_trophies.map(trophy => trophy.trophy_id);

        let today_trophies = await this.getTodayShopTrophys();
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
        const trophy_id_t = trophy_id.toLowerCase()
        const trophies = await this.getTodayShopTrophys();
        let trophy = trophies.find(elem => elem.trophy_id.toLowerCase() == trophy_id_t);
        if (!trophy){
            return 'NoTrophy'
        }
        let user = await this.getUser(user_id, ['money']);
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
    async addEventTrophy(user_id, trophy_id) {
        
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        
        if (!(await user.hasEventTrophy(trophy))) {
            await user.addEventTrophy(trophy);
        };
    },
    async hasEventTrophy(user_id, trophy_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        
        return (await user.hasEventTrophy(trophy))
    },

    async addEventTrophyUnchecked(user_id, trophy_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        await user.addEventTrophy(trophy);

    },
    async getEventTrophys() {
        const trophies = await EventTrophy.findAll();
        return trophies;
    },
    async  getEventTrophyWithName(name) {
        let name_t = name.toLowerCase();
        const trophy = await EventTrophy.findOne(
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
};
