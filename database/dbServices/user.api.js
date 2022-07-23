const Sequelize = require('sequelize');
const {userdata} =  require('../dbConnection/dbConnection');
const { User} = require('../dbObjects/full.model')(userdata, Sequelize.DataTypes);

module.exports = {
    async getUser(id) {
        let user = await User.findOne({
            where: { user_id: id },
        });

        if (!user) {
            user = await User.create({ user_id: id });
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
    async getUsersRankedByMoney(){
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
    async isMale (id) {
        let user = await this.getUser(id);
        return user.is_male
    },

};
