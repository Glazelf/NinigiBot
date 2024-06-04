import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('starboard_messages', {
        channel_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        message_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        starboard_channel_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        starboard_message_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};