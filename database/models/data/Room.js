module.exports = (sequelize, DataTypes) => {
    return sequelize.define('room', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        slots: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        timestamps: false,
    });
};