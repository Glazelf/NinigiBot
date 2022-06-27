module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/shinx.model')(sequelize, DataTypes);
	const Users = require('./models/user.model')(sequelize, DataTypes);
	const ShinxTrophy = require('./models/shinxTrophy.model')(sequelize, DataTypes);
	const ShopTrophy = require('./models/shopTrophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	Users.belongsToMany(ShinxTrophy, { through: 'ShinxTrophyUser' });
	ShinxTrophy.belongsToMany(Users, { through: 'ShinxTrophyUser' });
	Users.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser' });
	ShopTrophy.belongsToMany(Users, { through: 'ShopTrophyUser' });
	Users.hasOne(Shinx);
	sequelize.sync();
	return {Shinx, Users, ShinxTrophy, ShopTrophy};
}