import Sequelize from "sequelize";

export default () => {
    const History = Sequelize.define("History", {
        user_id: {
            type: Sequelize.DataTypes.STRING,
            primaryKey: true,
        },
        stan_amount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        combat_amount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        win_amount: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
    });
    return History;
};