module.exports = (sequelize, DataTypes) => {
    return sequelize.define('languages', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};