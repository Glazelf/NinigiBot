module.exports = (sequelize, DataTypes) => {

	const Shinx = require('./models/shinx.model')(sequelize, DataTypes);
	const Users = require('./models/user.model')(sequelize, DataTypes);

	return {Shinx, Users};
}