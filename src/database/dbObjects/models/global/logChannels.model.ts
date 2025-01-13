export default (sequelize: any, DataTypes: any) => {
    return sequelize.define('log_channels', {
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