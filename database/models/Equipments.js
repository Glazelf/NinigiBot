module.exports = (sequelize, DataTypes) => {
	return sequelize.define('equipment', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
        regen: {
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
        guard: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
        },
        safeguard: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
		},
		saiyan: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
        },
        ultrasaiyan: {
			type: DataTypes.BOOLEAN,
			allowNull: true,
		}
	}, {
		timestamps: false,
	});
};