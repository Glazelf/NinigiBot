module.exports = (sequelize, DataTypes) => {
    return sequelize.define('disabled_channels', {
        channel_id: {
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