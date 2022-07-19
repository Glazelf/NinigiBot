const Sequelize = require('sequelize');
const config = require('../../config.json');

const userdata = new Sequelize('userdata', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/userdata.sqlite',
});

const attatchments = new Sequelize('attatchments', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/attachments.sqlite',
});

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

module.exports = {userdata, attatchments};