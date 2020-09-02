module.exports = (sequelize, DataTypes) => {
	return sequelize.define('key_items', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		}
		//d
	}, {
		timestamps: false,
	});
};