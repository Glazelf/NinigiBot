import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('mod_enabled_servers', {
        server_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};