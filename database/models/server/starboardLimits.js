module.exports = (sequelize, DataTypes) => {
    return sequelize.define('starboard_limits', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        stars: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};