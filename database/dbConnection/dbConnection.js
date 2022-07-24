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

module.exports = {userdata, attatchments};