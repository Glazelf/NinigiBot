const Sequelize = require('sequelize');
const {sequelize} =  require('../dbConnection/dbConnection');

const { Shinx,ShinxTrophy, Users} = require('../dbObjects/full.model')(sequelize, Sequelize.DataTypes);
const shinx_util = require('../../utils/shinx.util');
const BRONZE_TROPHY_EXP = shinx_util.levelToExp(5);
const SILVER_TROPHY_EXP = shinx_util.levelToExp(15);
const GOLD_TROPHY_EXP = shinx_util.levelToExp(30);
const SHINY_CHARM_EXP = shinx_util.levelToExp(50);

function hasPassedLevel(from, to, middle) {
    return (from < to) && (middle <= to)
}


module.exports = {
    async getShinx(id) {
        let shinx = await Shinx.findOne({
            where: { user_id: id },
        });

        if (!shinx) {
            shinx = await Shinx.create({ user_id: id });
        };
        return shinx;
    },
    async addExperience(id, experience)  {
        let shinx = await this.getShinx(id);
        const res = await shinx.addExperienceAndLevelUp(experience);
        if(res.pre != res.post) {
            if(hasPassedLevel(res.pre, res.post, 5)){
                await this.addShinxTrophyUnchecked(id, 'Bronze ShinxTrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 15)){
                await this.addShinxTrophyUnchecked(id, 'Silver ShinxTrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 30)){
                await this.addShinxTrophyUnchecked(id, 'Gold ShinxTrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 50)){
                await this.addShinxTrophyUnchecked(id, 'Shiny Charm')
            }
        }
    },
    async addShinxTrophy(user_id, trophy_id) {
        let user = await Users.findOne({
            where: { user_id },
        });
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id: trophy_id.toLowerCase() },
        });
        
        if (!(await user.hasShinxTrophy(trophy))) {
            await user.addShinxTrophy(trophy);
        };
    },
    async addShinxTrophyUnchecked(user_id, trophy_id) {
        let user = await Users.findOne({
            where: { user_id },
        });
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id: trophy_id.toLowerCase() },
        });
        await user.addShinxTrophy(trophy);

    },
    async getShinxTrophies() {
        const trophies = await ShinxTrophy.findAll();
        return trophies;
    },
    async feedShinx(id) {
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
