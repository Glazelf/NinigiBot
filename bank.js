const Discord = require('discord.js');
const {Users} = require('./storeObjects');
module.exports = {
    bank : {
        _currency : null,
        get currency() {
            if (!this._currency) {
                console.log('PENIS')
                const money = new Discord.Collection();
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

 }
