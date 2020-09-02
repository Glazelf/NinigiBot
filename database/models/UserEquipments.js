module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_item', {
		user_id: DataTypes.STRING,
		item_id: DataTypes.STRING
	}, {
		timestamps: false,
	});
};