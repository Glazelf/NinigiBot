module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/shinx.model')(sequelize, DataTypes);
	const User = require('./models/user.model')(sequelize, DataTypes);
	const Trainer = require('./models/trainer.model')(sequelize, DataTypes);
	
	const ShinxTrophy = require('./models/shinxTrophy.model')(sequelize, DataTypes);
	const ShopTrophy = require('./models/shopTrophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	User.belongsToMany(ShinxTrophy, { through: 'ShinxTrophyUser' });
	ShinxTrophy.belongsToMany(User, { through: 'ShinxTrophyUser' });
	User.belongsToMany(ShopTrophy, { through: 'ShopTrophyUser' });
	ShopTrophy.belongsToMany(User, { through: 'ShopTrophyUser' });
	User.hasOne(Shinx);
	User.hasOne(Trainer);
	sequelize.sync();
	return {Shinx, User, Trainer, ShinxTrophy, ShopTrophy};
}