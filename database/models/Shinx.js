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
		exp: {
			type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: -54,
		},
		hunger: {
			type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5,
		},
		sleep: {
			type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5,
		},
		friendship: {
			type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0,
		},
		meetup: {
			type: DataTypes.STRING,
            allowNull: true,
		},
	}, {
		timestamps: false,
	});
};