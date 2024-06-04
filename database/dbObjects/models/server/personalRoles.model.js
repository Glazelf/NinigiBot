import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('personal_roles', {
        server_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        role_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};