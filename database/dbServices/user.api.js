const Sequelize = require('sequelize');
const { userdata } = require('../dbConnection/dbConnection');
const { User } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);
const { Op } = require('sequelize');
module.exports = {
    async getUser(id, attributes = null) {
        let user = await User.findByPk(param = id, options = {

            attributes: attributes
        });

        if (!user) user = await User.create({ user_id: id });
        return user;
    },
    async getAllUsers() {
        const users = await User.findAll();
        return users;
    },
    async bulkDeleteUsers(id_arr) {
        await User.destroy({
            where: { user_id: id_arr },
        });
        await userdata.models.Shinx.destroy({
            where: { user_id: id_arr },
        });
        await userdata.models.EventTrophyUser.destroy({
            where: { UserUserId: id_arr },
        });
        await userdata.models.ShopTrophyUser.destroy({
            where: { UserUserId: id_arr },
        });
    },
    // Money
    async addMoney(id, money) {
        let user = await this.getUser(id, ['user_id', 'money']);
        await user.addMoney(money);
    },
    async getMoney(id) {
        let user = await this.getUser(id, ['money']);
        return user.money;
    },
    async getUsersRankedByMoney() {
        let users_money = await User.findAll({
            attributes: [
                'user_id', 'money'
            ],
            order: [
                ["money", "DESC"],
            ],
        })
        return users_money;
    },
    // Birthday
    async getBirthday(id) {
        let user = await this.getUser(id, ['birthday']);
        return user.birthday;
    },
    async setBirthday(id, birthday) {
        let user = await this.getUser(id, ['user_id', 'birthday']);
        user.setBirthday(birthday);
    },
    // Switch Code
    async getSwitchCode(id) {
        let user = await this.getUser(id, ['swcode']);
        return user.swcode;
    },
    async setSwitchCode(id, swcode) {
        let user = await this.getUser(id, ['user_id', 'swcode']);
        user.setSwitchCode(swcode);
    },
    async buyFood(id, amount) {
        let user = await this.getUser(id, ['user_id', 'food', 'money']);

        let res = await user.hasMoney(amount);
        if (res) {
            await user.buyFood(amount);
            return true;
        }
        return false;
    },
};