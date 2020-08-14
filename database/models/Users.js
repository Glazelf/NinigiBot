
module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		swcode: {
			type: DataTypes.STRING,
			defaultValue: "None",
			allowNull: false,
		},
		biography: {
			type: DataTypes.STRING,
			defaultValue: "None",
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};