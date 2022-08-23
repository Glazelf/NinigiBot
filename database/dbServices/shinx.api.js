const Sequelize = require('sequelize');
const { userdata, serverdata} =  require('../dbConnection/dbConnection');
const { Op, fn, where, col  } = require('sequelize');
const { Shinx, EventTrophy, User} = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);
const { shinxQuotes } = require('../dbObjects/serverdata.model')(serverdata, Sequelize.DataTypes);
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
        const results = await Shinx.findAll({ attributes:['user_id','shiny','user_male'], where: { user_id: { [Op.ne]: exclude, [Op.in]: [...guild.members.cache.keys()] } }, order: Sequelize.fn('RANDOM'), limit: amount });
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
        let shinx = await this.getShinx(id, ['user_id','shiny']);
        return shinx.switchShininessAndGet();
    },
    async changeAutoFeed(id, mode) {
        let shinx = await this.getShinx(id, ['user_id','auto_feed']);
        return shinx.setAutoFeed(mode);
    },
    async addExperience(id, experience)  {
        let shinx = await this.getShinx(id, ['user_id','experience']);
        const res = await shinx.addExperienceAndLevelUp(experience);
        if(res.pre != res.post) {
            if(hasPassedLevel(res.pre, res.post, 5)){
                await this.addEventTrophy(id, 'Bronze Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 15)){
                await this.addEventTrophy(id, 'Silver Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 30)){
                await this.addEventTrophy(id, 'Gold Trophy')
            }
            if(hasPassedLevel(res.pre, res.post, 50)){
                await this.addEventTrophy(id, 'Shiny Charm')
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
    async feedShinx(id) {
        let shinx = await this.getShinx(id, ['user_id','belly', 'experience']);
        let shinx_hunger = shinx.getHunger()
        if(shinx_hunger == 0){
            return 'NoHungry'
        }
        let user = await this.getUser(id,['user_id','food']);

        let feed_amount = Math.min(shinx_hunger, user.getFood())
        if (feed_amount==0) {
            return 'NoFood'
        }
        await user.addFood(-feed_amount);
        await shinx.feedAndExp(feed_amount);
        return 'Ok'
    },
    async getShinxAutofeed(id) {
        let shinx = await this.getShinx(id, ['auto_feed'])
        return shinx.auto_feed;
    },   

    async autoFeedShinx1(id) {
        let shinx = await this.getShinx(id, ['user_id','belly', 'experience']);
        let shinx_hunger = shinx.getHunger()
        if(shinx_hunger == 0){
            return
        }
        let user = await this.getUser(id,['user_id','food']);

        let feed_amount = Math.min(shinx_hunger, user.getFood())
        if (feed_amount==0) {
            return
        }
        await user.addFood(-feed_amount);
        await shinx.feedAndExp(feed_amount);
    },

    async autoFeedShinx2(id) {
        let shinx = await this.getShinx(id, ['user_id','belly', 'experience']);
        let shinx_hunger = shinx.getHunger()
        if(shinx_hunger == 0){
            return
        }
        let user = await this.getUser(id,['user_id','food', 'money']);
        let used_food = 0;
        let used_money = 0;

        let feed_amount = Math.min(shinx_hunger, user.getFood())
        if (feed_amount!=0) {
            used_food = feed_amount;
            await user.addFood(-feed_amount);
            await shinx.feedAndExp(feed_amount);
        }
        shinx_hunger -= feed_amount;
        if(shinx_hunger != 0){
            feed_amount = Math.min(shinx_hunger, user.getMoney())
            if (feed_amount!=0) {
                used_money = feed_amount;
                await user.addMoney(-used_money);
            }
        }
        await user.reduceFoodMoney(used_food, used_money);
        await shinx.feedAndExp(used_food + used_money);
    },

    async nameShinx(id, nick) {
        const check = require('../../util/string/checkFormat')(nick, 12);
        if(check=='Ok'){
            let shinx = await this.getShinx(id, ['user_id','nickname']);
            shinx.changeNick(nick.trim());
        }
        return check
    },
    async isTrainerMale (id) {
        let shinx = await this.getShinx(id, ['user_male']);
        return shinx.user_male
    },
    async saveBattle(shinxBattleData, wins) {
        let shinx = await this.getShinx(shinxBattleData.owner.id);
        await shinx.saveBattle(shinxBattleData, wins);
    },
};
