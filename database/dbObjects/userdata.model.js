module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/userdata/shinx.model')(sequelize, DataTypes);
	const User = require('./models/userdata/user.model')(sequelize, DataTypes);
	
	const EventBadge = require('./models/items/eventBadge.model')(sequelize, DataTypes);
	const ShopBadge = require('./models/items/shopBadge.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	User.belongsToMany(EventBadge, { through: 'EventBadgeUser', timestamps: false});
	EventBadge.belongsToMany(User, { through: 'EventBadgeUser', timestamps: false});

	User.belongsToMany(ShopBadge, { through: 'ShopBadgeUser', timestamps: false});
	ShopBadge.belongsToMany(User, { through: 'ShopBadgeUser', timestamps: false});

	User.hasOne(Shinx);
	sequelize.sync();
	return {Shinx, User, EventBadge, ShopBadge};
}

