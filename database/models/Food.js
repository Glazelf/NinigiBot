module.exports = (sequelize, DataTypes) => {
	return sequelize.define('food', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		recovery: {
			type: DataTypes.FLOAT,
			allowNull: false,
		}
	}, {
		timestamps: false,
	});
};