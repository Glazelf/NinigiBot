const Discord = require('discord.js');
const { Users } = require('./dbObjects');
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
                            user.swcode = code
                            return user.save();
                        }
                        const newUser = await Users.create({ user_id: id, swcode:code });
                        money.set(id, newUser);
                        return newUser;
                    }
                });

                Reflect.defineProperty(money, 'getSwitchCode', {
                    value: function getSwitchCode(id) {
                        const user = money.get(id);
                        return user ? user.swcode : 'None';
                    },
                });

                Reflect.defineProperty(money, 'biography', {
                    value: async function biography(id, text) {
                        const user = money.get(id);
                        if (user) {
                            user.biography = text;
                            return user.save();
                        }
                        const newUser = await Users.create({ user_id: id, biograhy: text});
                        money.set(id, newUser);
                        return newUser;
                    }
                });

                Reflect.defineProperty(money, 'getBiography', {
                    value: function getBiography(id) {
                        const user = money.get(id);
                        return user ? user.biography : 'None';
                    },
                });

                Reflect.defineProperty(money, 'add', {
                    value: async function add(id, amount) {
                        const user = money.get(id);
                        if (user) {
                            user.balance += Number(amount);
                            return user.save();
                        }
                        const newUser = await Users.create({ user_id: id, balance: amount });
                        money.set(id, newUser);
                        return newUser;
                    }
                });

                Reflect.defineProperty(money, 'getBalance', {
                    value: function getBalance(id) {
                        const user = money.get(id);
                        return user ? user.balance : 0;
                    },
                });
                this._currency = money;

            }
            return this._currency;
        }
    }
};
