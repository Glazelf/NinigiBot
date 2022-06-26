module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/shinx.model')(sequelize, DataTypes);
	const Users = require('./models/user.model')(sequelize, DataTypes);
	const Trophy = require('./models/trophy.model')(sequelize, DataTypes);
//https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
	Users.belongsToMany(Trophy);
	Trophy.belongsToMany(Users);
	return {Shinx, Users, Trophy};
}