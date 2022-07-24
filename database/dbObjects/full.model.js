module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/userdata/shinx.model')(sequelize, DataTypes);
	const User = require('./models/userdata/user.model')(sequelize, DataTypes);
	
	const ShinxTrophy = require('./models/items/shinxTrophy.model')(sequelize, DataTypes);
	const ShopTrophy = require('./models/items/shopTrophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	User.belongsToMany(ShinxTrophy, { through: 'ShinxTrophyUser', onDelete: 'cascade', hooks:true});
	ShinxTrophy.belongsToMany(User, { through: 'ShinxTrophyUser', onDelete: 'cascade', hooks:true});

	User.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser', onDelete: 'cascade', hooks:true});
	ShopTrophy.belongsToMany(User, { through: 'ShopTrophyUser', onDelete: 'cascade', hooks:true});

	User.hasOne(Shinx, { foreignKey: 'user_id', onDelete: 'cascade', hooks:true});
	sequelize.sync();
	return {Shinx, User, ShinxTrophy, ShopTrophy};
}

