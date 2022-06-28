const Sequelize = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');

const { Users, ShinxTrophy } = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);

module.exports = {
    getUser : async (id) => {
        let user = await Users.findOne({
            where: { user_id: id },
        });

        if (!user) {
            user = await Users.create({ user_id: id });
        };
        return user;
    },
    addMoney : async (id, money) => {
        let user = await this.getUser(id);
        await user.addMoney(money);
    },
    buyFood : async (id, amount) => {
        let user = await this.getUser(id);
        let res = await user.hasMoney(amount);
        if (res) {
            await user.addMoney(id, -amount);
            await user.addFood(id, amount);
            return true
        }
        return false
    },
    addShinxTrophy : async (user_id, trophy_id) => {
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
    hasShinxTrophy : async (user_id, trophy_id) => {
        let user = await Users.findOne({
            where: { user_id },
        });
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id },
        });
        return (await user.hasShinxTrophy(trophy))
    },
    deleteShinxTrophy : async (user_id, trophy_id)=> {
        let user = await Users.findOne({
            where: { user_id },
        });
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id },
        });

        await user.ShinxTrophy(trophy);
    },
    updateShinxTrophies : async (user_id)=> {
        let user = await Users.findOne({
            where: { user_id },
        });
        let trophy = await Trophy.findOne({
            where: { trophy_id: 'Bronze Trophy' },
        });

        await user.removeShinxTrophy(trophy);
    },
};
