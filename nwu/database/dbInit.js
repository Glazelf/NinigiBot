const Sequelize = require('sequelize');
const {sequelize} =  require('./dbConnection/dbConnection');

const { Users, Shinx, ShinxTrophy, ShopTrophy } = require('./dbObjects/full.model')(sequelize, Sequelize.DataTypes);

const syncDatabase = async () => {
    try {
        await Users.sync({ alter: true });
        await Shinx.sync({ alter: true });
        await ShinxTrophy.sync({ alter: true });
        await ShopTrophy.sync({ alter: true });
        const trophies = [
            // SHINX
            ShinxTrophy.upsert({ 
                trophy_id: 'Bronze ShinxTrophy'.toLowerCase(), 
                icon: 'third_place', 
                description: 'Raise your Shinx to level 5'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Silver ShinxTrophy'.toLowerCase(), 
                icon: 'second_place', 
                description: 'Raise your Shinx to level 15'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Gold ShinxTrophy'.toLowerCase(), 
                icon: 'first_place', 
                description: 'Raise your Shinx to level 30'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Shiny Charm'.toLowerCase(), 
                icon: 'sparkles', 
                description: 'Raise your Shinx to level 50'
            }),
            
            // SHOP 
            ShopTrophy.upsert({ 
                trophy_id: 'Cheeseborgar'.toLowerCase(), 
                icon: 'hamburger', 
                description: 'A fat cheese burger full of cheese and burger',
                price: 100
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Balls'.toLowerCase(), 
                icon: 'volleyball', 
                description: 'Bigass BALL',
                price: 500
            }),
            
            // ShinxTrophy.upsert({ 
            //     trophy_id: 'Borger', 
            //     icon: 'sparkles', 
            //     description: 'Raise your Shinx to level 50'
            // }),    
        ]
        await Promise.all(trophies);
        console.log('NWU DB initialized!');
        sequelize.close();
    } catch (e) {
        console.log(e)
    };
};

syncDatabase();