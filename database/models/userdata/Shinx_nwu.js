module.exports = (sequelize, DataTypes) => {
    return sequelize.define('shinx', {
        user_id: DataTypes.STRING,
        user_male: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
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
        exp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        fullness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        happiness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        lastmeet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Math.floor(Date.now() / (1000 * 60 * 60)),
        },
        meetup: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false,
    });
};