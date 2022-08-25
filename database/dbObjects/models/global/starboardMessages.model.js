module.exports = (sequelize, DataTypes) => {
    return sequelize.define('starboard_messages', {
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        starboard_channel_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        starboard_message_id: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};