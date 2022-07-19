const Sequelize = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');
const { Op } = require('sequelize');
const { User, Trainer} = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);

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
    async getTrainer(id) {
        let trainer = await Trainer.findOne({
            where: { user_id: id },
        });

        if (!trainer) {
            trainer = await Trainer.create({ user_id: id });
        };
        return trainer;
    },
    async buyFood (id, amount) {
        let user = await this.getUser(id);
        
        let res = await user.hasMoney(amount);
        if (res) {
            let trainer = await this.getTrainer(id);
            await user.addMoney(id, -amount);
            await trainer.addFood(id, amount);
            return true
        }
        return false
    },


};
