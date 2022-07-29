const Sequelize = require('sequelize');
const { userdata, serverdata} =  require('../dbConnection/dbConnection');
const { Op, fn, where, col  } = require('sequelize');
const { Shinx, EventTrophy, User} = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);
const { shinxQuotes } = require('../dbObjects/serverdata.model')(serverdata, Sequelize.DataTypes);
const shinx_util = require('../../util/nwu/shinx.util');
const hasPassedLevel = require('../../util/shinx/hasPassedLevel');

module.exports = {
    async getShinx(id, attributes=null) {
        let shinx = await Shinx.findByPk(param=id, options={
            
            attributes:attributes
        });
        if (!shinx) {
            await this.getUser(id);
            shinx = await Shinx.create({ user_id: id });
        } 
        await shinx.checkup()
        return shinx;
    },
        
    async getUser(id, attributes=null) {
        let user = await User.findByPk(param=id, options={
            
            attributes:attributes
        });

        if (!user) {
            user = await User.create({ user_id: id });
        };
        return user;
    },
    async getRandomShinx(amount, exclude, guild) {
        const results = await Shinx.findAll({ where: { user_id: { [Op.ne]: exclude, [Op.in]: [...guild.members.cache.keys()] } }, order: Sequelize.fn('RANDOM'), limit: amount });
        return results.map(res => res.dataValues);
    },
    async getShinxShininess(id) {
        let shinx = await this.getShinx(id, ['shiny'])
        return shinx.shiny;
    },    
    async getRandomReaction() {
        const result = await shinxQuotes.findOne({ order: Sequelize.fn('RANDOM') });
        // console.log(result);
        return result;
    },
    async switchShininessAndGet(id) {
        let shinx = await this.getShinx(id, ['shiny']);
        return shinx.switchShininessAndGet();
    },
    async addExperience(id, experience)  {
        let shinx = await this.getShinx(id, ['experience']);
        const res = await shinx.addExperienceAndLevelUp(experience);
        if(res.pre != res.post) {
            if(hasPassedLevel(res.pre, res.post, 5)){
                await this.addEventTrophyUnchecked(id, 'Bronze Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 15)){
                await this.addEventTrophyUnchecked(id, 'Silver Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 30)){
                await this.addEventTrophyUnchecked(id, 'Gold Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 50)){
                await this.addEventTrophyUnchecked(id, 'Shiny Charm')
            }
        }
    },
    async hasEventTrophy(user_id, trophy_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        
        return (await user.hasEventTrophy(trophy))
    },
    async addEventTrophy(user_id, trophy_id) {
        
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        
        if (!(await user.hasEventTrophy(trophy))) {
            await user.addEventTrophy(trophy);
        };
    },
    async addEventTrophyUnchecked(user_id, trophy_id) {
        let user = await this.getUser(user_id, ['user_id']);
        let trophy_id_t = trophy_id.toLowerCase();
        const trophy = await EventTrophy.findOne(
            {attributes:['trophy_id'], where: where(fn('lower', col('trophy_id')), trophy_id_t)}
        );
        await user.addEventTrophy(trophy);

    },
    async feedShinx(id) {
        let shinx = await this.getShinx(id, ['belly']);
        let shinx_hunger = shinx.getHunger()
        if(shinx_hunger == 0){
            return 'NoHungry'
        }
        let user = await this.getUser(id,['food']);

        let feed_amount = Math.min(shinx_hunger, user.getFood())
        if (feed_amount==0) {
            return 'NoFood'
        }
        await user.addFood(-feed_amount);
        await shinx.feed(feed_amount);
        await this.addExperience(id, feed_amount);
        return 'Ok'
    },

    async nameShinx(id, nick) {
        let pnick = nick.trim();
        if (pnick.length < 1) {
            return 'TooShort'
        } else if ( pnick.length > 12) {
            return 'TooLong'
        } else if (!pnick.match(/^[a-z0-9]+$/i)){
            return 'InvalidChars'
        }
        let shinx = await this.getShinx(id);
        shinx.changeNick(pnick);
        return 'Ok'
    },
    async isTrainerMale (id) {
        let shinx = await this.getShinx(id);
        return shinx.user_male
    },
    async saveBattle(shinxBattleData, wins) {
        let shinx = await this.getShinx(shinxBattleData.owner.id);
        await shinx.saveBattle(shinxBattleData, wins);
    },
};
