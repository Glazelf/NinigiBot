module.exports = (sequelize, DataTypes) => {
    return sequelize.define('equipment', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        regen: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        heal: {
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
        geass: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        ultrageass: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        }
    }, {
        timestamps: false,
    });
};