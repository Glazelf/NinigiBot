module.exports = (sequelize, DataTypes) => {
	return sequelize.define('eligible_roles', {
		role_id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		timestamps: false,
	});
};