module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/userdata/shinx.model')(sequelize, DataTypes);
	const User = require('./models/userdata/user.model')(sequelize, DataTypes);
	const History = require('./models/userdata/history.model')(sequelize, DataTypes);
	
	const EventTrophy = require('./models/items/eventTrophy.model')(sequelize, DataTypes);
	const ShopTrophy = require('./models/items/shopTrophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	User.belongsToMany(EventTrophy, { through: 'EventTrophyUser', timestamps: false});
	EventTrophy.belongsToMany(User, { through: 'EventTrophyUser', timestamps: false});

	User.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser', timestamps: false});
	ShopTrophy.belongsToMany(User, { through: 'ShopTrophyUser', timestamps: false});

	User.hasOne(Shinx, {foreignKey:'user_id'});
	User.hasOne(History, {foreignKey:'user_id'});
	sequelize.sync();
	return {Shinx, User, EventTrophy, ShopTrophy, History};
}

