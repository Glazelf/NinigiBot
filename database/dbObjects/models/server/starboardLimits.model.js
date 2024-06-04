import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('starboard_limits', {
        server_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        star_limit: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};