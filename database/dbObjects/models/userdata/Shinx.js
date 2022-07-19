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
        equipment: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'None',
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
        sleeping: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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