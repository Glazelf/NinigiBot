const Sequelize = require('sequelize');
const { userdata } =  require('../dbConnection/dbConnection');
const { User, Shinx, EventBadge, ShopBadge } = require('../dbObjects/userdata.model')(userdata, Sequelize.DataTypes);

module.exports = async (reset_db) => {
    
    try {
        if(reset_db) {
            await userdata.drop()
            console.log(`Deleted Database: User Data ✔`);
        }
        await User.sync({ alter: true });
        await Shinx.sync({ alter: true });
        await EventBadge.sync({ alter: true });
        await ShopBadge.sync({ alter: true });
        const badges = [
            // ===================
            //       SHINX
            // ===================
            EventBadge.upsert({ 
                badge_id: 'Bronze Badge', 
                icon: 'third_place', 
                description: 'Badge given to novice Shinx trainers',
                origin: 'Raise your Shinx to level 5'
            }),
            EventBadge.upsert({ 
                badge_id: 'Silver Badge', 
                icon: 'second_place', 
                description: 'Badge given to amateur Shinx trainers',
                origin: 'Raise your Shinx to level 15'
            }),
            EventBadge.upsert({ 
                badge_id: 'Gold Badge', 
                icon: 'first_place', 
                description: 'Badge given to expert Shinx trainers',
                origin: 'Raise your Shinx to level 30'
            }),
            EventBadge.upsert({ 
                badge_id: 'Shiny Charm', 
                icon: 'sparkles', 
                description: 'Charm given only to the best Shinx trainers',
                origin: 'Raise your Shinx to level 50'
            }),
            // ===================
            //       EVENTS
            // ===================
            EventBadge.upsert({ 
                badge_id: 'Fighter Badge', 
                icon: 'boom', 
                description: 'Badge given only to trainers that find pleasure in fighting',
                origin: 'Become the user that has battled the most'
            }),
            EventBadge.upsert({ 
                badge_id: 'Frontier Brain Badge', 
                icon: 'trident', 
                description: 'Badge given only to most unbeatable trainer',
                origin: 'Become the user with most wins in combat'
            }),
            EventBadge.upsert({ 
                badge_id: 'Shinx Breeder', 
                icon: 'muscle', 
                description: 'Badge given only to most dedicated Shinx breeders',
                origin: 'Become the user with the highest Shinx level'
            }),
            EventBadge.upsert({ 
                badge_id: 'Unbreakable Bond', 
                icon: 'heart_on_fire', 
                description: 'Badge given only to people whose bond with Shinx is unbreakable',
                origin: 'Become the user with the highest amount of interactions with Shinx'
            }),
            EventBadge.upsert({ 
                badge_id: 'Stanned Being', 
                icon: 'clap', 
                description: 'Badge given only to most stanned people',
                origin: 'Become the most stanned user by Ninigi'
            }),
            EventBadge.upsert({ 
                badge_id: 'Capitalism Addict', 
                icon: 'money_with_wings', 
                description: 'Certificate that only the wealthiest beings possess.',
                origin: 'Become the user with the highest amount of money'
            }),
            // ===================
            //       SHOP
            // ===================
            ShopBadge.upsert({ 
                badge_id: 'Cheeseborgar', 
                icon: 'hamburger', 
                description: 'A fat cheese burger full of cheese and burger',
                price: 1000
            }),
            ShopBadge.upsert({ 
                badge_id: 'BALLS', 
                icon: 'volleyball', 
                description: 'Ancient artifact from the server. It is said that you can hear an echoe when listening closely to its surface.',
                price: 5000
            }),
            ShopBadge.upsert({ 
                badge_id: 'Wandering Spirit', 
                icon: 'ghost', 
                description: 'This little ghost has been running all the time. He just wants a friend',
                price: 250
            }),
            ShopBadge.upsert({ 
                badge_id: 'Gaming Insect', 
                icon: 'space_invader', 
                description: 'Bug that lives inside every console that is not Xbox since boxes scare it',
                price: 150
            }),
            ShopBadge.upsert({ 
                badge_id: 'Funny Clown', 
                icon: 'clown', 
                description: 'Savage obvious guy, gobbling yogurts. It is said that its name is hidden inside this text.',
                price: 150
            }),
            ShopBadge.upsert({ 
                badge_id: 'Mankind Shard', 
                icon: 'brain', 
                description: 'Old artifact found by some scientists not much ago. It is said to be used by politicians in the past.',
                price: 250
            }),
            ShopBadge.upsert({ 
                badge_id: 'Golden Relic', 
                icon: 'crown', 
                description: 'Unknown artifact which is said to have been dropped by a king',
                price: 250
            }),   
            ShopBadge.upsert({ 
                badge_id: 'Ice Face', 
                icon: 'cold_face', 
                description: 'Mysterious trainer who did not make it through route 217',
                price: 500
            }),   
            ShopBadge.upsert({ 
                badge_id: 'Wild duck', 
                icon: 'duck', 
                description: 'A duck that lives in the Shinx server. It do be a duck.',
                price: 500
            }),   
            ShopBadge.upsert({ 
                badge_id: 'Wild monke', 
                icon: 'monkey', 
                description: 'A monkey that used to be human. He really rejected humanity',
                price: 500
            }),   
            ShopBadge.upsert({ 
                badge_id: `Zacian's sword`, 
                icon: 'dagger', 
                description: 'Something that Zacian lost last time it was busy rotating',
                price: 1500
            }),
            ShopBadge.upsert({ 
                badge_id: `Zamacenta's shield`, 
                icon: 'shield', 
                description: 'Something that Zamacenta lost last time it was busy rotating',
                price: 1500
            }),
            ShopBadge.upsert({ 
                badge_id: `Eternatus's gun`, 
                icon: 'gun', 
                description: `Something that Eternatus lost last time it was busy rotating in Pokemon Gun. Wait you didn't play that game?`,
                price: 2500
            }),   
            ShopBadge.upsert({ 
                badge_id: `Lloyd's key`, 
                icon: 'key', 
                description: `Precious item that Lloyd from Code Geass lost while having a cup of tea in the server`,
                price: 1800
            }),   
            ShopBadge.upsert({ 
                badge_id: `COVID-78 vaccine`, 
                icon: 'syringe', 
                description: `Vaccine made in 2078 to gain inmunity agaist the Omega COVID-78 HD 2.8 & Knucles.`,
                price: 3600
            }),   
            ShopBadge.upsert({ 
                badge_id: `Pelipper's letter`, 
                icon: 'envelope', 
                description: `Something that a random Pelipper was carrying. It says: W8N3WJPK`,
                price: 1800
            }),  
            ShopBadge.upsert({ 
                badge_id: `Rules of the Server`, 
                icon: 'scroll', 
                description: `A print of the rules of the server so that you also not read them in real life`,
                price: 4000
            }),   
            ShopBadge.upsert({ 
                badge_id: `Centro Pokemon source`, 
                icon: 'shell', 
                description: `Centro Pokemon reliable source of information. It is said to answer all questions with almost certainty.`,
                price: 2600
            }),  
            ShopBadge.upsert({ 
                badge_id: `OoT Chinken`, 
                icon: 'rooster', 
                description: `A chinken from Kakariko village. Habitants say that something really weird happens when you hit it with your sword.`,
                price: 2500
            }),  
            ShopBadge.upsert({ 
                badge_id: `Kyogre's fart`, 
                icon: 'ocean', 
                description: `Anomaly that happens in the oceans when Kyogre eats tacos`,
                price: 2500
            }), 
            ShopBadge.upsert({ 
                badge_id: `Salad`, 
                icon: 'salad', 
                description: `Bunch of vegetables that are prone to vent`,
                price: 3000
            }), 
            ShopBadge.upsert({ 
                badge_id: `Dango`, 
                icon: 'dango', 
                description: `Dango dango dango dango dango daikazoku!`,
                price: 1700
            }),  
            ShopBadge.upsert({ 
                badge_id: `Pain with S`, 
                icon: 'flag_ea', 
                description: `Flag from an ancient country which was said to be full of people whose salaries were negative.`,
                price: 2600
            }),  
            ShopBadge.upsert({ 
                badge_id: `Otaku Destroyer ZX 6600`, 
                icon: 'shower', 
                description: `Outstanding weapon created by humanity in order to eliminate all otakus from the world.`,
                price: 2200
            }),  
            ShopBadge.upsert({ 
                badge_id: `Genshin Impact`, 
                icon: 'poop', 
                description: `Cute being whose name is arbitrary. It do be vibing tho`,
                price: 2200
            }),  
            ShopBadge.upsert({ 
                badge_id: `Ninigi Soldier`, 
                icon: 'robot', 
                description: `Powerful robot done with the most recent machinery. It is said to be created by an AI known as Ninigi.`,
                price: 3500
            }), 
            ShopBadge.upsert({ 
                badge_id: `Shoe`, 
                icon: 'athletic_shoe', 
                description: `A shoe YOOOOOOOOOOOOOOOO`,
                price: 500
            }), 
            ShopBadge.upsert({ 
                badge_id: `Mod Application Ticket`, 
                icon: 'tickets', 
                description: `A ticket made by the admin of the server. It is said that those who have it are candidates to be mod.`,
                price: 9999
            }),  
            ShopBadge.upsert({ 
                badge_id: `Monitor ZX Shinx&Co`, 
                icon: 'desktop', 
                description: `Monitor from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }), 
            ShopBadge.upsert({ 
                badge_id: `Keyboard ZX Shinx&Co`, 
                icon: 'keyboard', 
                description: `Keyboard from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }),  
            ShopBadge.upsert({ 
                badge_id: `Mouse ZX Shinx&Co`, 
                icon: 'mouse_three_button', 
                description: `Mouse from the ZX series of Shinx Company. It is no longer available in shops.`,
                price: 2700
            }),  
            ShopBadge.upsert({ 
                badge_id: `Sussy Extinguisher`, 
                icon: 'fire_extinguisher', 
                description: `Fire Extinguisher. Kinda SUS ngl.`,
                price: 1800
            }),  
            ShopBadge.upsert({ 
                badge_id: `Ninigi's Chip`, 
                icon: 'diamond_shape_with_a_dot_inside', 
                description: `A copy of Ninigi's CPU. No longer manufactured.`,
                price: 9500
            }),  
            ShopBadge.upsert({ 
                badge_id: `Grass`, 
                icon: 'herb', 
                description: `Common plant found in nature. For some reason gamers don't like to touch it.`,
                price: 2200
            }),  
            ShopBadge.upsert({ 
                badge_id: `Area 11`, 
                icon: 'japan', 
                description: `Downscaled replica of the Area 11 from the Code Geass series`,
                price: 3400
            }),  
            
        ]
        await Promise.all(badges);
        console.log(`Initialized Database: User ✔`);
        await userdata.close();
    } catch (e) {
        console.log(e)
    };
};