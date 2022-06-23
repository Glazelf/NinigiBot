const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');

const { Users, Shinx } = require('./dbObjects/full.model')(sequelize, Sequelize.DataTypes);

const syncDatabase = async () => {
    try {
        await Users.sync({ alter: true });
        await Shinx.sync({ alter: true });

        console.log('NWU DB initialized!');
        sequelize.close();
    } catch (e) {
        console.log(e)
    };
};

syncDatabase();