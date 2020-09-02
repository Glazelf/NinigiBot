const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database/database.sqlite',
});

const Users = require('./database/models/Users')(sequelize, Sequelize.DataTypes);

const UserItems = require('./database/models/UserItems')(sequelize, Sequelize.DataTypes);
const UserFoods = require('./database/models/UserFoods')(sequelize, Sequelize.DataTypes);
const UserEquipments = require('./database/models/UserEquipments')(sequelize, Sequelize.DataTypes);
const UserKeys = require('./database/models/UserKeys')(sequelize, Sequelize.DataTypes);
const UserRooms = require('./database/models/UserRooms')(sequelize, Sequelize.DataTypes);

const EligibleRoles = require('./database/models/EligibleRoles')(sequelize, Sequelize.DataTypes);
const BattleItems = require('./database/models/BattleItems')(sequelize, Sequelize.DataTypes);
const Equipments = require('./database/models/Equipments')(sequelize, Sequelize.DataTypes);
const Foods = require('./database/models/Foods')(sequelize, Sequelize.DataTypes);
const KeyItems = require('./database/models/KeyItems')(sequelize, Sequelize.DataTypes);
const Room  = require('./database/models/Room')(sequelize, Sequelize.DataTypes);
const Shinx = require('./database/models/Shinx')(sequelize, Sequelize.DataTypes);

const syncDatabase = async() => {
	try{
		await Users.sync({ alter: true });

		await EligibleRoles.sync({ alter: true });
		
		await UserItems.sync({ alter: true });
		await UserFoods.sync({ alter: true });
		await UserEquipments.sync({ alter: true });
		await UserKeys.sync({ alter: true });
		await UserRooms.sync({ alter: true });

		await Shinx.sync({alter:true})
		await BattleItems.sync({ force: true })
		await Equipments.sync({ force: true })
		await Foods.sync({ force: true })
		await KeyItems.sync({ force: true })
		await Room.sync({ force: true })
		const shop = [
			BattleItems.upsert({ name: 'potion', cost: 10, percentage:0.2 }),
			BattleItems.upsert({ name: 'saiyan berry', cost: 50, saiyan: true  }),
	
			Equipments.upsert({ name: 'sun glasses', cost: 50, saiyan: true, guard: true  }),
			
			Foods.upsert({ name: 'Fried seedot', cost: 40, recovery: 1  }),
	
			KeyItems.upsert({ name: 'Skaidus poster', cost: 999999 }),
	
			Room.upsert({ name: 'Chalice chamber', cost: 999999, slots: 5 })
		]
		await Promise.all(shop);
		console.log('Store updated');
		sequelize.close();
	}catch(e){
		console.log(e)
	}
	
}

syncDatabase(); 
//Run force : true ONLY IF YOU WANT TO RESET THE SAVED ITEMS

/* Users.sync({ alter: true });
EligibleRoles.sync({ alter: true });
UserItems.sync({ alter: true });
Shinx.sync({alter:true})
BattleItems.sync({ force: true }).then(async () => {
	const shop = [
		BattleItems.upsert({ name: 'potion', cost: 10, percentage:0.2 }),
		BattleItems.upsert({ name: 'saiyan berry', cost: 50, saiyan: true  }),


			];
	
}).catch(console.error); */