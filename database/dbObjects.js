const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database/database.sqlite',
});

const Users = require('./models/Users')(sequelize, Sequelize.DataTypes);
const Shinx = require('./models/Shinx')(sequelize, Sequelize.DataTypes)
const CurrencyShop = require('./models/CurrencyShop')(sequelize, Sequelize.DataTypes);
const UserItems = require('./models/UserItems')(sequelize, Sequelize.DataTypes);
const EligibleRoles = require('./models/EligibleRoles')(sequelize, Sequelize.DataTypes);
UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

Shinx.prototype.levelUp = function (experience) {
	this.level += experience;
	this.save();
	return this.level;
}

Shinx.prototype.changeNick = function (newNick) {
	this.nick = newNick;
	this.save();
	return this.nick;
}

Shinx.prototype.sleeping = function (sleep) {
	this.sleep = Math.max(Math.min(100, this.sleep + sleep), 0);
	this.save();
	return this.sleep;
}

Shinx.prototype.eat = function (food) {
	this.hunger = Math.max(Math.min(100, this.hunger + food), 0);
	this.save();
	return this.hunger;
}

Shinx.prototype.shine = function () {
	this.shiny = !this.shiny
	this.save();
	return this.shiny;
}

Users.prototype.addItem = async function (item) {
	const useritem = await UserItems.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	if (useritem) {
		useritem.amount += 1;
		return useritem.save();
	};

	return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
};

Users.prototype.removeItem = async function (item) {
	const useritem = await UserItems.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	if (useritem) {
		useritem.amount -= 1;
		if (useritem.amount === 0) {
			useritem.destroy();
		} else {
			useritem.save();
		};
		return true;
	};
	return false;
};

Users.prototype.getItems = function () {
	return UserItems.findAll({
		where: { user_id: this.user_id },
		include: ['item'],
	});
};

module.exports = { Users, CurrencyShop, UserItems, EligibleRoles, Shinx };