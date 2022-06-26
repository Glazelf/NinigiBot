const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');

const { Users, Shinx, Trophy } = require('./dbObjects/full.model')(sequelize, Sequelize.DataTypes);

const syncDatabase = async () => {
    try {
        await Users.sync({ alter: true });
        await Shinx.sync({ alter: true });
        await Trophy.sync({ alter: true });
        const shop = [
            Trophy.upsert({ 
                trophy_id: 'Bronze Trophy', 
                icon: 'third_place', 
                description: 'Raise your Shinx to level 5'
            }),
            Trophy.upsert({ 
                trophy_id: 'Silver Trophy', 
                icon: 'second_place', 
                description: 'Raise your Shinx to level 15'
            }),
            Trophy.upsert({ 
                trophy_id: 'Gold Trophy', 
                icon: 'first_place', 
                description: 'Raise your Shinx to level 30'
            }),
            Trophy.upsert({ 
                trophy_id: 'Shiny Charm', 
                icon: 'sparkles', 
                description: 'Raise your Shinx to level 50'
            }),
            // Trophy.upsert({ 
            //     trophy_id: 'Borger', 
            //     icon: 'sparkles', 
            //     description: 'Raise your Shinx to level 50'
            // }),    
        ]
        await Promise.all(shop);
        console.log('NWU DB initialized!');
        sequelize.close();
    } catch (e) {
        console.log(e)
    };
};

syncDatabase();