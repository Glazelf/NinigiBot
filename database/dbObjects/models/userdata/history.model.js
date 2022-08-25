module.exports = (sequelize, DataTypes) => {

    const History = sequelize.define('History', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        stan_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        combat_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        win_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
    });
    return History;
};