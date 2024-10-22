import { Sequelize } from "sequelize";

const userdata = new Sequelize('userdata', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/userdata.sqlite',
});

const serverdata = new Sequelize('serverdata', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/serverdata.sqlite',
});

export { userdata, serverdata };