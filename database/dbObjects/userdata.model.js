import Sequelize from 'sequelize';

export default () => {
    const Shinx = require('./models/userdata/shinx.model')();
    const User = require('./models/userdata/user.model')();
    const History = require('./models/userdata/history.model')();
    const EventTrophy = require('./models/items/eventTrophy.model')();
    const ShopTrophy = require('./models/items/shopTrophy.model')();
    // https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
    User.belongsToMany(EventTrophy, { through: 'EventTrophyUser', timestamps: false });
    EventTrophy.belongsToMany(User, { through: 'EventTrophyUser', timestamps: false });
    User.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser', timestamps: false });
    ShopTrophy.belongsToMany(User, { through: 'ShopTrophyUser', timestamps: false });
    User.hasOne(Shinx, { foreignKey: 'user_id' });
    User.hasOne(History, { foreignKey: 'user_id' });
    Sequelize.sync();
    return { Shinx, User, EventTrophy, ShopTrophy, History };
};