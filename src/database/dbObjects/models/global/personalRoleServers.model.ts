export default (sequelize: any, DataTypes: any) => {
    return sequelize.define('personal_role_servers', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};