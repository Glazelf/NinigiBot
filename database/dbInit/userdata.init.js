const Sequelize = require('sequelize');
const { userdata } =  require('../dbConnection/dbConnection');
const { User, Shinx, EventTrophy, ShopTrophy } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

module.exports = async (reset_db) => {
    
    try {
        if(reset_db) {
            await userdata.drop()
            console.log(`Deleted Database: User Data ✔`);
        }
        await User.sync({ alter: true });
        await Shinx.sync({ alter: true });
        await EventTrophy.sync({ alter: true });
        await ShopTrophy.sync({ alter: true });
        const trophies = [
            // ===================
            //       SHINX
            // ===================
            EventTrophy.upsert({ 
                trophy_id: 'Bronze Trophy', 
                icon: ':third_place:', 
                description: 'Trophy given to novice Shinx trainers',
                origin: 'Raise your Shinx to level 5'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Silver Trophy', 
                icon: ':second_place:', 
                description: 'Trophy given to amateur Shinx trainers',
                origin: 'Raise your Shinx to level 15'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Gold Trophy', 
                icon: ':first_place:', 
                description: 'Trophy given to expert Shinx trainers',
                origin: 'Raise your Shinx to level 30'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Shiny Charm', 
                icon: ':sparkles:', 
                description: 'Charm given only to the best Shinx trainers',
                origin: 'Raise your Shinx to level 50'
            }),
            // ===================
            //       EVENTS
            // ===================
            EventTrophy.upsert({ 
                trophy_id: 'Fighter Trophy', 
                icon: ':boom:', 
                description: 'Trophy given only to trainers that find pleasure in fighting',
                origin: 'Become the user that has battled the most'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Frontier Brain Trophy', 
                icon: ':trident:', 
                description: 'Trophy given only to most unbeatable trainer',
                origin: 'Become the user with most wins in combat'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Shinx Breeder', 
                icon: ':muscle:', 
                description: 'Trophy given only to most dedicated Shinx breeders',
                origin: 'Become the user with the highest Shinx level'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Unbreakable Bond', 
                icon: ':heart_on_fire:', 
                description: 'Trophy given only to people whose bond with Shinx is unbreakable',
                origin: 'Become the user with the highest amount of interactions with Shinx'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Stanned Being', 
                icon: ':clap:', 
                description: 'Trophy given only to most stanned people',
                origin: 'Become the most stanned user by Ninigi'
            }),
            EventTrophy.upsert({ 
                trophy_id: 'Capitalism Addict', 
                icon: ':money_with_wings:', 
                description: 'Certificate that only the wealthiest beings possess.',
                origin: 'Become the user with the highest amount of money'
            }),
            // ===================
            //       SHOP
            // ===================
            ShopTrophy.upsert({ 
                trophy_id: 'Cheeseborgar', 
                icon: ':hamburger:', 
                description: 'A fat cheese burger full of cheese and burger',
                price: 1000
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'BALLS', 
                icon: ':volleyball:', 
                description: 'Ancient artifact from the server. It is said that you can hear an echoe when listening closely to its surface.',
                price: 5000
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Wandering Spirit', 
                icon: ':ghost:', 
                description: 'This little ghost has been running all the time. He just wants a friend',
                price: 250
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Gaming Insect', 
                icon: ':space_invader:', 
                description: 'Bug that lives inside every console that is not Xbox since boxes scare it',
                price: 150
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Funny Clown', 
                icon: ':clown:', 
                description: 'Savage obvious guy, gobbling yogurts. It is said that its name is hidden inside this text.',
                price: 150
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Mankind Shard', 
                icon: ':brain:', 
                description: 'Old artifact found by some scientists not much ago. It is said to be used by politicians in the past.',
                price: 250
            }),
            ShopTrophy.upsert({ 
                trophy_id: 'Golden Relic', 
                icon: ':crown:', 
                description: 'Unknown artifact which is said to have been dropped by a king',
                price: 250
            }),   
            ShopTrophy.upsert({ 
                trophy_id: 'Ice Face', 
                icon: ':cold_face:', 
                description: 'Mysterious trainer who did not make it through route 217',
                price: 500
            }),   
            ShopTrophy.upsert({ 
                trophy_id: 'Wild duck', 
                icon: ':duck:', 
                description: 'A duck that lives in the Shinx server. It do be a duck.',
                price: 500
            }),   
            ShopTrophy.upsert({ 
                trophy_id: 'Wild monke', 
                icon: ':monkey:', 
                description: 'A monkey that used to be human. He really rejected humanity',
                price: 500
            }),   
            ShopTrophy.upsert({ 
                trophy_id: `Zacian's sword`, 
                icon: ':dagger:', 
                description: 'Something that Zacian lost last time it was busy rotating',
                price: 1500
            }),
            ShopTrophy.upsert({ 
                trophy_id: `Zamacenta's shield`, 
                icon: ':shield:', 
                description: 'Something that Zamacenta lost last time it was busy rotating',
                price: 1500
            }),
            ShopTrophy.upsert({ 
                trophy_id: `Eternatus's gun`, 
                icon: ':gun:', 
                description: `Something that Eternatus lost last time it was busy rotating in Pokemon Gun. Wait you didn't play that game?`,
                price: 2500
            }),   
            ShopTrophy.upsert({ 
                trophy_id: `Lloyd's key`, 
                icon: ':key:', 
                description: `Precious item that Lloyd from Code Geass lost while having a cup of tea in the server`,
                price: 1800
            }),   
            ShopTrophy.upsert({ 
                trophy_id: `COVID-78 vaccine`, 
                icon: ':syringe:', 
                description: `Vaccine made in 2078 to gain inmunity agaist the Omega COVID-78 HD 2.8 & Knucles.`,
                price: 3600
            }),   
            ShopTrophy.upsert({ 
                trophy_id: `Pelipper's letter`, 
                icon: ':envelope:', 
                description: `Something that a random Pelipper was carrying. It says: W8N3WJPK`,
                price: 1800
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Rules of the Server`, 
                icon: ':scroll:', 
                description: `A print of the rules of the server so that you also not read them in real life`,
                price: 4000
            }),   
            ShopTrophy.upsert({ 
                trophy_id: `Centro Pokemon source`, 
                icon: ':shell:', 
                description: `Centro Pokemon reliable source of information. It is said to answer all questions with almost certainty.`,
                price: 2600
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `OoT Chinken`, 
                icon: ':rooster:', 
                description: `A chinken from Kakariko village. Habitants say that something really weird happens when you hit it with your sword.`,
                price: 2500
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Kyogre's fart`, 
                icon: ':ocean:', 
                description: `Anomaly that happens in the oceans when Kyogre eats tacos`,
                price: 2500
            }), 
            ShopTrophy.upsert({ 
                trophy_id: `Salad`, 
                icon: ':salad:', 
                description: `Bunch of vegetables that are prone to vent`,
                price: 3000
            }), 
            ShopTrophy.upsert({ 
                trophy_id: `Dango`, 
                icon: ':dango:', 
                description: `Dango dango dango dango dango daikazoku!`,
                price: 1700
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Pain with S`, 
                icon: ':flag_ea:', 
                description: `Flag from an ancient country which was said to be full of people whose salaries were negative.`,
                price: 2600
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Otaku Destroyer ZX 6600`, 
                icon: ':shower:', 
                description: `Outstanding weapon created by humanity in order to eliminate all otakus from the world.`,
                price: 2200
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Genshin Impact`, 
                icon: ':poop:', 
                description: `Cute being whose name is arbitrary. It do be vibing tho`,
                price: 2200
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Ninigi Soldier`, 
                icon: ':robot:', 
                description: `Powerful robot done with the most recent machinery. It is said to be created by an AI known as Ninigi.`,
                price: 3500
            }), 
            ShopTrophy.upsert({ 
                trophy_id: `Shoe`, 
                icon: ':athletic_shoe:', 
                description: `A shoe YOOOOOOOOOOOOOOOO`,
                price: 500
            }), 
            ShopTrophy.upsert({ 
                trophy_id: `Mod Application Ticket`, 
                icon: ':tickets:', 
                description: `A ticket made by the admin of the server. It is said that those who have it are candidates to be mod.`,
                price: 9999
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Monitor ZX Shinx&Co`, 
                icon: ':desktop:', 
                description: `Monitor from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }), 
            ShopTrophy.upsert({ 
                trophy_id: `Keyboard ZX Shinx&Co`, 
                icon: ':keyboard:', 
                description: `Keyboard from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Mouse ZX Shinx&Co`, 
                icon: ':mouse_three_button:', 
                description: `Mouse from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Sussy Extinguisher`, 
                icon: ':fire_extinguisher:', 
                description: `Fire Extinguisher. Kinda SUS ngl.`,
                price: 1800
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Ninigi's Chip`, 
                icon: ':diamond_shape_with_a_dot_inside:', 
                description: `A copy of Ninigi's CPU. No longer manufactured.`,
                price: 9500
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Grass`, 
                icon: ':herb:', 
                description: `Common plant found in nature. For some reason gamers don't like to touch it.`,
                price: 2200
            }),  
            ShopTrophy.upsert({ 
                trophy_id: `Area 11`, 
                icon: ':japan:', 
                description: `Downscaled replica of the Area 11 from the Code Geass series`,
                price: 3400
            }),  
            
        ]
        await Promise.all(trophies);
        console.log(`Initialized Database: User ✔`);
        await userdata.close();
    } catch (e) {
        console.log(e)
    };
};