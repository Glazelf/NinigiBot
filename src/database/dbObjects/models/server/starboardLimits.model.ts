export default (sequelize: any, DataTypes: any) => {
    return sequelize.define('starboard_limits', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        star_limit: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};