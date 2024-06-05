export default (sequelize, DataTypes) => {
    return sequelize.define('vc_text_channels', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        channel_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};