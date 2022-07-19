const Sequelize = require('sequelize');
const config = require('../config.json');

const sequelize = new Sequelize('database', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/database.sqlite',
});

const attatchments = new Sequelize('attatchments', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/models/attachments/attachments.sqlite',
});

const levelExp = (lvl) => {
    return (6 / 5) * (lvl) ** 3 - 15 * (lvl) ** 2 + 100 * lvl - 140;
};
const shinxQuotes = require('./models/attachments/shinxQuotes')(attatchments, Sequelize.DataTypes);
//const Users = require('./models/userdata/Users')(sequelize, Sequelize.DataTypes);
//const Shinx = require('./models/userdata/Shinx')(sequelize, Sequelize.DataTypes)

const EligibleRoles = require('./models/server/EligibleRoles')(sequelize, Sequelize.DataTypes);
const PersonalRoles = require('./models/server/PersonalRoles')(sequelize, Sequelize.DataTypes);
const PersonalRoleServers = require('./models/global/PersonalRoleServers')(sequelize, Sequelize.DataTypes);
const ModEnabledServers = require('./models/global/ModEnabledServers')(sequelize, Sequelize.DataTypes);
const LogChannels = require('./models/global/LogChannels')(sequelize, Sequelize.DataTypes);
const StarboardChannels = require('./models/global/StarboardChannels')(sequelize, Sequelize.DataTypes);
const StarboardMessages = require('./models/global/StarboardMessages')(sequelize, Sequelize.DataTypes);
const StarboardLimits = require('./models/server/StarboardLimits')(sequelize, Sequelize.DataTypes);

const numberParser = require('../util/parseInteger')

// // TO SHINX
// Shinx.prototype.see = function () {
//     const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
//     const hoursPassed = currentHour - this.lastmeet;
//     if (this.sleep === 0) this.sleeping = true;
//     if (hoursPassed === 0) return;
//     if (this.sleeping) this.varySleep(hoursPassed * 2);
//     else this.varySleep(-hoursPassed * 0.001);
//     if (this.sleep === 1) this.sleeping = false;
//     if (this.sleep === 0) this.sleeping = true;
//     this.varyHunger(-hoursPassed * 0.01);
//     if (hoursPassed >= 7 * 24) this.varyFriendship(-0.1 * Math.trunc(hoursPassed / 7 * 24));
//     this.lastmeet = currentHour;
//     this.save();
//     return this.sleeping;
// };

// // Trainer.swapAndGetGender
// Shinx.prototype.trans = function () {
//     this.user_male = !this.user_male;
//     this.save();
//     return this.user_male;
// };



module.exports = { shinxQuotes, 
    //Users,
    // Shinx,
    EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers};
