module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eligible_roles', {
        role_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false,
    });
};