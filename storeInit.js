
const Sequelize = require('sequelize');


const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const CurrencyShop = require('./models/CurrencyShop')(sequelize, Sequelize.DataTypes);
require('./models/Users')(sequelize, Sequelize.DataTypes);
require('./models/UserItems')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: 'Juice', cost: 20}),
		CurrencyShop.upsert({ name: 'Pokeball', cost: 50 }),
		CurrencyShop.upsert({ name: 'Water', cost: 10 }),
		CurrencyShop.upsert({ name: 'Keysss', cost: 200 }),
		CurrencyShop.upsert({ name: 'Chocolate', cost: 75 }),
		CurrencyShop.upsert({ name: 'Shinx shirt', cost: 500 }),
		CurrencyShop.upsert({ name: 'Gilgamesh nudes', cost: 750 }),
		CurrencyShop.upsert({ name: 'Konohana figure', cost: 1000}),
		CurrencyShop.upsert({ name: 'Geass', cost: 1500 }),
		CurrencyShop.upsert({ name: 'CC figure', cost: 2000 }),
		CurrencyShop.upsert({ name: 'Gold dango', cost: 1200 }),
		CurrencyShop.upsert({ name: 'Skaidus poster', cost: 2500 }),
	];
	await Promise.all(shop);
	console.log('Store updated');
	sequelize.close();
}).catch(console.error);