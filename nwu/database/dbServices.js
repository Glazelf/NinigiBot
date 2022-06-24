const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');
const CLEAN_TRESHOLD = 1000;


const Discord = require('discord.js');
const { Users, Shinx } = require('./dbObjects/full.model')(sequelize, Sequelize.DataTypes);

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

                this._services = services;
            };
            return this._services;
        }
    }
};
