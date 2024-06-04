import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('personal_role_servers', {
        server_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};