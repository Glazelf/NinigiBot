const Discord = require('discord.js');
const { Users, Shinx, shinxQuotes } = require('./dbObjects');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    bank: {
        _currency: null,
        get currency() {
            if (!this._currency) {
                const money = new Discord.Collection();
                Reflect.defineProperty(money, 'switchCode', {
                    value: async function switchCode(id, code) {
                        const user = money.get(id);
                        if (user) {
                            user.swcode = code;
                            return user.save();
                        };
                        const newUser = await Users.create({ user_id: id, swcode: code });
                        money.set(id, newUser);
                        return newUser;
                    },
                });

                Reflect.defineProperty(money, 'payBattle', {
                    value: function payBattle(from, to) {
                        const paidMoney = Math.min(Math.floor(this.getBalance(from) * 0.1), Math.floor(this.getBalance(to) * 0.1));
                        if (paidMoney === 0) return 0;
                        this.add(from, -paidMoney);
                        this.add(to, paidMoney);
                        return paidMoney;
                    },
                });

                Reflect.defineProperty(money, 'getShinx', {
                    value: async function getShinx(id) {
                        const parseMeetDate = require('../util/parseMeetDate');
                        let user = money.get(id);

                        if (!user) {
                            user = await Users.create({ user_id: id });
                            money.set(id, user);
                        };
                        let shinx = await Shinx.findOne({
                            where: { user_id: id },
                        });

                        if (!shinx) {
                            const now = new Date();
                            meetup = parseMeetDate(now.getDate(), now.getMonth(), now.getFullYear());
                            shinx = await Shinx.create({ user_id: id, meetup: meetup });
                        };
                        return shinx;
                    },
                });

                Reflect.defineProperty(money, 'getRandomShinx', {
                    value: async function getRandomShinx(amount, exclude, guild) {
                        const results = await Shinx.findAll({ where: { user_id: { [Op.ne]: exclude, [Op.in]: [...guild.members.cache.keys()] } }, order: Sequelize.fn('RANDOM'), limit: amount });
                        return results.map(res => res.dataValues);
                    }
                });

                Reflect.defineProperty(money, 'getRandomReaction', {
                    value: async function getRandomReaction() {
                        const result = await shinxQuotes.findOne({ order: Sequelize.fn('RANDOM') });
                        // console.log(result);
                        return result;
                    }
                });

                Reflect.defineProperty(money, 'updateShinx', {
                    value: async function updateShinx(shinxBattle, wins) {
                        let shinx = await Shinx.findOne({
                            where: { user_id: shinxBattle.owner.id },
                        });
                        await shinx.updateData(shinxBattle, wins);
                    },
                });

                Reflect.defineProperty(money, 'getSwitchCode', {
                    value: function getSwitchCode(id) {
                        const user = money.get(id);
                        return user ? user.swcode : 'None';
                    },
                });

                Reflect.defineProperty(money, 'birthday', {
                    value: async function birthday(id, birthday) {
                        const user = money.get(id);
                        if (user) {
                            user.birthday = birthday;
                            return user.save();
                        };
                        const newUser = await Users.create({ user_id: id, birthday: birthday });
                        money.set(id, newUser);
                        return newUser;
                    },
                });

                Reflect.defineProperty(money, 'getBirthday', {
                    value: function getBirthday(id) {
                        const user = money.get(id);
                        return user ? user.birthday : null;
                    },
                });

                Reflect.defineProperty(money, 'add', {
                    value: async function add(id, amount) {
                        const user = money.get(id);
                        if (user) {
                            user.balance += Number(amount);
                            user.balance = Math.floor(user.balance);
                            return user.save();
                        };
                        const newUser = await Users.create({ user_id: id, balance: amount });
                        money.set(id, newUser);
                        return newUser;
                    },
                });

                Reflect.defineProperty(money, 'getBalance', {
                    value: function getBalance(id) {
                        const user = money.get(id);
                        return user ? user.balance : 0;
                    },
                });
                this._currency = money;
            };
            return this._currency;
        }
    }
};
