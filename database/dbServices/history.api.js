const Sequelize = require('sequelize');
const { Op, fn, where, col } = require('sequelize');
const { userdata } = require('../dbConnection/dbConnection');

const { User, Shinx, ShopTrophy, EventTrophy, History } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

const DAILY_TROPHIES = 5;

module.exports = {
    async getUser(id, attributes = null) {
        let user = await User.findByPk(param = id, options = {
            attributes: attributes
        });

        if (!user) {
            user = await User.create({ user_id: id });
        };
        return user;
    },
    async getHistory(id, attributes = null) {
        let history = await History.findByPk(param = id, options = {

            attributes: attributes
        });

        if (!history) {
            await this.getUser(id);
            history = await History.create({ user_id: id });
        };
        return history;
    },
    async incrementStanAmount(id) {
        let history = await this.getHistory(id, ['user_id']);
        await history.increment('stan_amount');
    },
    async incrementCombatAmount(id, won = false) {
        let attributes = ['combat_amount'];
        if (won) attributes = attributes.concat(['win_amount']);
        history = await this.getHistory(id, ['user_id']);
        await history.increment(attributes);
    },
    async checkEvent(Model, trophy_id, attribute) {
        let instances = await Model.findAll({
            attributes: [
                'user_id', attribute
            ],
            order: [
                [attribute, "DESC"],
            ],
        })
        if (instances.length == 0) return;
        await userdata.models.EventTrophyUser.destroy({
            where: { EventTrophyTrophyId: trophy_id }
        });
        await userdata.models.EventTrophyUser.create({
            UserUserId: instances[0].user_id,
            EventTrophyTrophyId: trophy_id
        });
    },

    async checkEvents() {
        const events = [
            this.checkEvent(User, 'Capitalism Addict', 'money'),
            this.checkEvent(Shinx, 'Unbreakable Bond', 'experience'),
            this.checkEvent(History, 'Fighter Trophy', 'combat_amount'),
            this.checkEvent(History, 'Frontier Brain Trophy', 'win_amount'),
            this.checkEvent(History, 'Stanned Being', 'stan_amount'),
        ]
        await Promise.all(events);
    },
};