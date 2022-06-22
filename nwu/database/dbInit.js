const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');

require('./dbObjects/shinx.db')(sequelize, Sequelize);
require('./dbObjects/user.db')(sequelize, Sequelize);