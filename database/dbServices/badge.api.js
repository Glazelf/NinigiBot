const Sequelize = require('sequelize');
const { Op, fn, where, col } = require('sequelize');
const {userdata} =  require('../dbConnection/dbConnection');

const { User, ShopBadge, EventBadge } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

const DAILY_BADGES = 5;

module.exports = {
    async getUser(id, attributes=null) {
        let user = await User.findByPk({
            param:id,
            attributes:attributes
        });

        if (!user) {
            user = await User.create({ user_id: id });
        };
        return user;
    },
    async getBadgeSlice(amount){
        let EventBadges = await EventBadge.findall({attributes: ['badge_id', 'icon']});
        let shopbadges = await ShopBadge.findall({attributes: ['badge_id', 'icon']});
        EventBadges.concat(shopbadges);
    },
    async  getShopBadges() {
        const badges = await ShopBadge.findAll();
        return badges;
    },

    async  getTodayShopBadges() {
        const d = new Date();
        
        const badges = await ShopBadge.findAll();
        let index = (d.getDate() + d.getFullYear() ) % badges.length;
        const today_badges = []
        const today_indexes = []
        for (let i = 0; i < DAILY_BADGES  ; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%badges.length);
            }
            today_badges.push(badges[index])
            today_indexes.push(index)
            index = (index+DAILY_BADGE)%badges.length
        }
        return today_badges;
    },

    async  getTodayShopBadgesToBuy(money) {
        const d = new Date();
        
        const badges = await ShopBadge.findAll({attributes: [
            'badge_id', 'price'
        ]});
        let index = (d.getDate() + d.getFullYear()) % badges.length;
        let today_badges = []
        const today_indexes = []
        for (let i = 0; i < DAILY_BADGES  ; i++){
            while (today_indexes.includes(index)){
                index = ((index+1)%badges.length);
            }
            today_badges.push(badges[index])
            today_indexes.push(index)
            index = (index+DAILY_BADGE)%badges.length
        }
        today_badges = today_badges.filter(badge => badge.price <= money)
        badges_ids = today_badges.map(badge=> badge.badge_id)
        return badges_ids;
    },
    
    async  getShopBadgeWithName(name) {
        let name_t = name.toLowerCase();
        const badge = await ShopBadge.findOne(
            {
                where: {
                    [Op.or]: [
                        where(fn('lower', col('badge_id')), name_t),
                      { icon: name_t }
                    ]
                  }
              }
        );
        return badge;
    },

    async getBuyableShopBadges(user_id) {        
        let user = await this.getUser(user_id)
        const user_badges = await user.getShopBadges()
        const user_badges_list = user_badges.map(badge => badge.badge_id);

        let today_badges = await this.getTodayShopBadgesToBuy(user.money);
        today_badges = today_badges.filter(badge => !(badge in user_badges_list))
        return today_badges
    },

    async getFullBuyableShopBadges(user_id) {        
        let user = await this.getUser(user_id)
        const user_badges = await user.getShopBadges()
        const user_badges_list = user_badges.map(badge => badge.badge_id);

        let today_badges = await this.getTodayShopBadges();
        today_badges.forEach(badge => {
            // can't buy, can buy, bought
            if(user_badges_list.includes(badge.badge_id)){
                badge.temp_bought = 'Bought'
            } else {
                badge.temp_bought = badge.price > user.money? 'CantBuy' : 'CanBuy'
            }
        })
        return today_badges
    },

    async buyShopBadge(user_id, badge_id) {
        const badge_id_t = badge_id.toLowerCase()
        const badges = await this.getTodayShopBadges();
        let badge = badges.find(elem => elem.badge_id.toLowerCase() == badge_id_t);
        if (!badge){
            return 'NoBadge'
        }
        let user = await this.getUser(user_id, ['money']);
        if (await user.hasShopBadge(badge)){
            return 'HasBadge'
        }
        if (user.money < badge.price){
            return 'NoMoney'
        }
        
        await user.addShopBadge(badge);
        await user.addMoney(-badge.price);
        return 'Ok'
    },
    async addEventBadge(user_id, badge_id) {
        
        let user = await this.getUser(user_id, ['user_id']);
        let badge_id_t = badge_id.toLowerCase();
        const badge = await EventBadge.findOne(
            {attributes:['badge_id'], where: where(fn('lower', col('badge_id')), badge_id_t)}
        );
        
        if (!(await user.hasEventBadge(badge))) {
            await user.addEventBadge(badge);
        };
    },
    async hasEventBadge(user_id, badge_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let badge_id_t = badge_id.toLowerCase();
        const badge = await EventBadge.findOne(
            {attributes:['badge_id'], where: where(fn('lower', col('badge_id')), badge_id_t)}
        );
        
        return (await user.hasEventBadge(badge))
    },

    async addEventBadgeUnchecked(user_id, badge_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let badge_id_t = badge_id.toLowerCase();
        const badge = await EventBadge.findOne(
            {attributes:['badge_id'], where: where(fn('lower', col('badge_id')), badge_id_t)}
        );
        await user.addEventBadge(badge);

    },
    async getEventBadges() {
        const badges = await EventBadge.findAll();
        return badges;
    },
    async  getEventBadgeWithName(name) {
        let name_t = name.toLowerCase();
        const badge = await EventBadge.findOne(
            {
                where: {
                    [Op.or]: [
                      { badge_id: name_t },
                      { icon: name_t }
                    ]
                  }
              }
        );
        return badge;
    },
};
