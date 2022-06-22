const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');

const Shinx_db  = require('./dbObjects/shinx.db')(sequelize, Sequelize);
const User_db  = require('./dbObjects/user.db')(sequelize, Sequelize);

module.exports = { Shinx_db, User_db};