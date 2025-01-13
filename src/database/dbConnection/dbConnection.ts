import { Sequelize } from "sequelize";

// @ts-expect-error TS(2345): Argument of type 'string | undefined' is not assig... Remove this comment to see the full error message
const userdata = new Sequelize('userdata', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/userdata.sqlite',
});

// @ts-expect-error TS(2345): Argument of type 'string | undefined' is not assig... Remove this comment to see the full error message
const serverdata = new Sequelize('serverdata', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/dbConnection/serverdata.sqlite',
});

export { userdata, serverdata };