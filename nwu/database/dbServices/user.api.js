const Sequelize = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');
const { Op } = require('sequelize');
const { Users} = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);

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
    async addMoney(id, money){
        let user = await this.getUser(id);
        await user.addMoney(money);
    },
    async buyFood (id, amount) {
        let user = await this.getUser(id);
        let res = await user.hasMoney(amount);
        if (res) {
            await user.addMoney(id, -amount);
            await user.addFood(id, amount);
            return true
        }
        return false
    },


};
