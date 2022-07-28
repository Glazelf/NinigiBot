const Sequelize = require('sequelize');
const { userdata } =  require('../dbConnection/dbConnection');
const { User, Shinx, ShinxTrophy, ShopTrophy } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

module.exports = async (reset_db) => {
    
    try {
        if(reset_db) {
            await userdata.drop()
            console.log(`Deleted Database: User Data ✔`);
        }
        await User.sync({ alter: true });
        await Shinx.sync({ alter: true });
        await ShinxTrophy.sync({ alter: true });
        await ShopTrophy.sync({ alter: true });
        const trophies = [
            // ===================
            //       SHINX
            // ===================
            ShinxTrophy.upsert({ 
                trophy_id: 'Bronze ShinxTrophy'.toLowerCase(), 
                icon: 'third_place', 
                description: 'Badge given to novice Shinx trainers',
                origin: 'Raise your Shinx to level 5'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Silver ShinxTrophy'.toLowerCase(), 
                icon: 'second_place', 
                description: 'Badge given to amateur Shinx trainers',
                origin: 'Raise your Shinx to level 15'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Gold ShinxTrophy'.toLowerCase(), 
                icon: 'first_place', 
                description: 'Badge given to expert Shinx trainers',
                origin: 'Raise your Shinx to level 30'
            }),
            ShinxTrophy.upsert({ 
                trophy_id: 'Shiny Charm'.toLowerCase(), 
                icon: 'sparkles', 
                description: 'Charm given only to the best Shinx trainers',
                origin: 'Raise your Shinx to level 50'
            }),
            
            // ===================
            //       SHOP
            // ===================
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
            ShopTrophy.upsert({ 
                trophy_id: 'Wandering Spirit'.toLowerCase(), 
                icon: 'ghost', 
                description: 'This little ghost has been running all the time. He just wants a friend',
                price: 250
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Gaming Insect'.toLowerCase(), 
                icon: 'space_invader', 
                description: 'Bug that lives inside every console that is not Xbox since boxes scare it',
                price: 150
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Funny Clown'.toLowerCase(), 
                icon: 'clown', 
                description: 'Savage obvious guy, gobbling yogurts. It is said that its name is hidden inside this text.',
                price: 150
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Mankind Shard'.toLowerCase(), 
                icon: 'brain', 
                description: 'Old artifact found by some scientists not much ago. It is said to be used by politicians in the past.',
                price: 250
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Golden Relic'.toLowerCase(), 
                icon: 'crown', 
                description: 'Unknown artifact which is said to have been dropped by a king',
                price: 250
            }),   
        ]
        await Promise.all(trophies);
        console.log(`Initialized Database: User ✔`);
        await userdata.close();
    } catch (e) {
        console.log(e)
    };
};