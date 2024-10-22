import { Sequelize } from "sequelize";

const userdata = new Sequelize('userdata', process.env.dbUsername, process.env.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/userdata.sqlite',
});

const serverdata = new Sequelize('serverdata', process.env.dbUsername, process.env.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/serverdata.sqlite',
});

export { userdata, serverdata };