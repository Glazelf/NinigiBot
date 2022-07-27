module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/userdata/shinx.model')(sequelize, DataTypes);
	const User = require('./models/userdata/user.model')(sequelize, DataTypes);
	
	const ShinxTrophy = require('./models/items/shinxTrophy.model')(sequelize, DataTypes);
	const ShopTrophy = require('./models/items/shopTrophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	User.belongsToMany(ShinxTrophy, { through: 'ShinxTrophyUser'});
	ShinxTrophy.belongsToMany(User, { through: 'ShinxTrophyUser'});

	User.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser'});
	ShopTrophy.belongsToMany(User, { through: 'ShopTrophyUser'});

	User.hasOne(Shinx);
	sequelize.sync();
	return {Shinx, User, ShinxTrophy, ShopTrophy};
}

