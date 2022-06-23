const Sequelize = require('sequelize');
const config = require('../../../config.json');

const sequelize = new Sequelize('database', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'nwu/database/dbConnection/database.nwu.sqlite',
});

module.exports = {sequelize};