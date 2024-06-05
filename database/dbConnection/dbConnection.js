import { Sequelize } from "sequelize";
import config from "../../config.json" with { type: "json" };

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

export { userdata, serverdata };