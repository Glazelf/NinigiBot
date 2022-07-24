const Sequelize = require('sequelize');
const { userdata, attatchments} =  require('../dbConnection/dbConnection');
const { Op } = require('sequelize');
const { Shinx,ShinxTrophy, User} = require('../dbObjects/full.model')(userdata, Sequelize.DataTypes);
const { shinxQuotes } = require('../dbObjects/server.model')(attatchments, Sequelize.DataTypes);
const shinx_util = require('../../util/nwu/shinx.util');
const hasPassedLevel = require('../../util/shinx/hasPassedLevel');

module.exports = {
    async getShinx(id) {
        let shinx = await Shinx.findOne({
            where: { user_id: id },
        });
        if (!shinx) {
            await this.getUser(id);
            shinx = await Shinx.create({ user_id: id });
        } 
        await shinx.checkup()
        return shinx;
    },
        
    async getUser(id) {
        let user = await User.findOne({
            where: { user_id: id },
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
        let shinx = await this.getShinx(id)
        return shinx.shiny;
    },    
    async getRandomReaction() {
        const result = await shinxQuotes.findOne({ order: Sequelize.fn('RANDOM') });
        // console.log(result);
        return result;
    },
    async switchShininessAndGet(id) {
        let shinx = await this.getShinx(id);
        return shinx.switchShininessAndGet();
    },
    async addExperience(id, experience)  {
        let shinx = await this.getShinx(id);
        const res = await shinx.addExperienceAndLevelUp(experience);
        if(res.pre != res.post) {
            if(hasPassedLevel(res.pre, res.post, 5)){
                await this.addShinxTrophyUnchecked(id, 'bronze shinxtrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 15)){
                await this.addShinxTrophyUnchecked(id, 'silver shinxtrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 30)){
                await this.addShinxTrophyUnchecked(id, 'gold shinxtrophy')
            }
            if(hasPassedLevel(res.pre, res.post, 50)){
                await this.addShinxTrophyUnchecked(id, 'shiny charm')
            }
        }
    },
    async addShinxTrophy(user_id, trophy_id) {
        
        let user = await this.getUser(user_id);
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id: trophy_id.toLowerCase() },
        });
        
        if (!(await user.hasShinxTrophy(trophy))) {
            await user.addShinxTrophy(trophy);
        };
    },
    async hasShinxTrophy(user_id, trophy_id) {
        let user = await this.getUser(user_id);
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id: trophy_id.toLowerCase() },
        });
        
        return (await user.hasShinxTrophy(trophy))
    },

    async addShinxTrophyUnchecked(user_id, trophy_id) {
        let user = await this.getUser(user_id);
        let trophy = await ShinxTrophy.findOne({
            where: { trophy_id },
        });
        await user.addShinxTrophy(trophy);

    },
    async getShinxTrophies() {
        const trophies = await ShinxTrophy.findAll();
        return trophies;
    },
    async  getShinxTrophyWithName(name) {
        let name_t = name.toLowerCase();
        const trophy = await ShinxTrophy.findOne(
            {
                where: {
                    [Op.or]: [
                      { trophy_id: name_t },
                      { icon: name_t }
                    ]
                  }
              }
        );
        return trophy;
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
