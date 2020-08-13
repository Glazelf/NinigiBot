module.exports = (sequelize, DataTypes) => {
	return sequelize.define('eligible_roles', {
		name: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		timestamps: false,
	});
};