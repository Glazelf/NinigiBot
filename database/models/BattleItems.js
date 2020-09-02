module.exports = (sequelize, DataTypes) => {
	return sequelize.define('battle_item', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		percentage: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		food: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		sleep: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		friendship: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		saiyan: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
		}
	}, {
		timestamps: false,
	});
};