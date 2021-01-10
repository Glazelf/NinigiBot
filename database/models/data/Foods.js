module.exports = (sequelize, DataTypes) => {
    return sequelize.define('food', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        recovery: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        timestamps: false,
    });
};