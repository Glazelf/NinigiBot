module.exports = (sequelize, DataTypes) => {
    return sequelize.define('personal_roles', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};