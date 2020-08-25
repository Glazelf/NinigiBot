module.exports = (sequelize, DataTypes) => {
	return sequelize.define('shinx', {
		user_id: DataTypes.STRING,
		nick: {
            type: DataTypes.STRING,
            defaultValue: "Shinx",
			allowNull: false,
		},
		shiny: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
			allowNull: false,
		},
		level: {
			type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
		},
		hunger: {
			type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50,
		},
		sleep: {
			type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50,
		},
		friendship: {
			type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
		},
	}, {
		timestamps: false,
	});
};