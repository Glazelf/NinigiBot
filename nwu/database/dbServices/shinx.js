const Sequelize = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');

const { Shinx } = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);

module.exports = {
    getShinx : async id => {
        let shinx = await Shinx.findOne({
            where: { user_id: id },
        });

        if (!shinx) {
            shinx = await Shinx.create({ user_id: id });
        };
        return shinx;
    },
    addExperience : async (id, experience) => {
        let shinx = await this.getShinx(id);
        await shinx.addExperience(experience);
    },
    feedShinx : async id => {
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
    }
};
