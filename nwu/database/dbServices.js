const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');
const CLEAN_TRESHOLD = 1000;


const Discord = require('discord.js');
const { Users, Shinx, ShinxTrophy, ShopTrophy } = require('./dbObjects/full.model')(sequelize, Sequelize.DataTypes);

module.exports = {
    nwu_db: {
        _services: null,
        get services() {
            if (!this._services) {
                const services = new Discord.Collection();

                Reflect.defineProperty(services, 'clean', {
                    value: async function clean() {
                        if (services.size > CLEAN_TRESHOLD){
                            services.clear()
                        }
                    },
                });

                Reflect.defineProperty(services, 'getShinx', {
                    value: async function getShinx(id) {
                        let shinx = await Shinx.findOne({
                            where: { user_id: id },
                        });

                        if (!shinx) {
                            shinx = await Shinx.create({ user_id: id });
                        };
                        return shinx;
                    },
                });

                Reflect.defineProperty(services, 'getUser', {
                    value: async function getUser(id) {
                        let user = await Users.findOne({
                            where: { user_id: id },
                        });

                        if (!user) {
                            user = await Users.create({ user_id: id });
                        };
                        return user;
                    },
                });

                Reflect.defineProperty(services, 'addExperience', {
                    value: async function addExperience(id, experience) {
                        let shinx = await this.getShinx(id);
                        await shinx.addExperience(experience);
                    },
                });

                Reflect.defineProperty(services, 'feedShinx', {
                    value: async function feedShinx(id) {
                        let shinx = await this.getShinx(id);
                        let shinx_hunger = shinx.getHunger()
                        if(shinx_hunger == 0){
                            return 'NoHungry'
                        }
                        let user = await this.getUser(id);

                        let feed_amount = Math.min(shinx_hunger, user.getFood())
                        if (feed_amount==0) {
                            return 'NoFood'
                        }
                        await user.addFood(-feed_amount);
                        await shinx.feed(feed_amount);
                        return 'Ok'
                    },
                });

                Reflect.defineProperty(services, 'addMoney', {
                    value: async function addMoney(id, money) {
                        let user = await this.getUser(id);
                        await user.addMoney(money);
                    },
                });

                Reflect.defineProperty(services, 'buyFood', {
                    value: async function buyFood(id, amount) {
                        let user = await this.getUser(id);
                        let res = await user.hasMoney(amount);
                        if (res) {
                            await user.addMoney(id, -amount);
                            await user.addFood(id, amount);
                            return true
                        }
                        return false
                    },
                });

                Reflect.defineProperty(services, 'addShinxTrophy', {
                    value: async function addShinxTrophy(user_id, trophy_id) {
                        let user = await Users.findOne({
                            where: { user_id },
                        });
                        let trophy = await ShinxTrophy.findOne({
                            where: { trophy_id },
                        });

                        if (!(await user.hasShinxTrophy(trophy))) {
                            await user.addShinxTrophy(trophy);
                        };
                    },
                });

                Reflect.defineProperty(services, 'hasShinxTrophy', {
                    value: async function hasShinxTrophy(user_id, trophy_id) {
                        let user = await Users.findOne({
                            where: { user_id },
                        });
                        let trophy = await ShinxTrophy.findOne({
                            where: { trophy_id },
                        });
                        return (await user.hasShinxTrophy(trophy))
                    },
                });

                Reflect.defineProperty(services, 'deleteShinxTrophy', {
                    value: async function deleteShinxTrophy(user_id, trophy_id) {
                        let user = await Users.findOne({
                            where: { user_id },
                        });
                        let trophy = await ShinxTrophy.findOne({
                            where: { trophy_id },
                        });

                        await user.ShinxTrophy(trophy);
                    },
                });

                Reflect.defineProperty(services, 'updateShinxTrophies', {
                    value: async function updateShinxTrophies(user_id) {
                        let user = await Users.findOne({
                            where: { user_id },
                        });
                        let trophy = await Trophy.findOne({
                            where: { trophy_id: 'Bronze Trophy' },
                        });

                        await user.removeShinxTrophy(trophy);
                    },
                });

                Reflect.defineProperty(services, 'getShopTrophies', {
                    value: async function getShopTrophies() {
                        const trophies = await ShopTrophy.findAll();
                        return trophies;
                    },
                });

                Reflect.defineProperty(services, 'getBuyableShopTrophies', {
                    value: async function getBuyableShopTrophies(user_id) {
                        let user = await Users.findOne({
                            where: { user_id },
                        });
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
                });

                Reflect.defineProperty(services, 'buyShopTrophy', {
                    value: async function buyShopTrophy(user_id, trophy_id) {
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
                });

                this._services = services;
            };
            return this._services;
        }
    }
};
