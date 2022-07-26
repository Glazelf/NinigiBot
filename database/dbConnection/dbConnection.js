const Sequelize = require('sequelize');
const config = require('../../config.json');

const userdata = new Sequelize('userdata', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/userdata.sqlite',
});

const serverdata = new Sequelize('serverdata', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/serverdata.sqlite',
});

module.exports = {userdata, serverdata};