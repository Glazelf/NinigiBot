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
    // Money
    async addMoney(id, money){
        let user = await this.getUser(id);
        await user.addMoney(money);
    },
    async getMoney(id){
        let user = await this.getUser(id);
        return user.money;
    },
    // Birthday
    async getBirthday(id){
        let user = await this.getUser(id);
        return user.birthday;
    },
    async setBirthday(id, birthday){
        let user = await this.getUser(id);
        user.setBirthday(birthday);
    },
    // Switch Code
    async getSwitchCode(id){
        let user = await this.getUser(id);
        return user.birthday;
    },
    async setSwitchCode(id, swcode){
        let user = await this.getUser(id);
        user.setSwitchCode(swcode);
    },

};
