import Sequelize from 'sequelize';

export default () => {
    return Sequelize.define('vc_text_channels', {
        server_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        channel_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};