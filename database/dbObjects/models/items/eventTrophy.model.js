import Sequelize from "sequelize";

export default () => {
    const Trophy = Sequelize.define('EventTrophy', {
        trophy_id: {
            type: Sequelize.DataTypes.STRING,
            primaryKey: true,
        },
        icon: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        },
        origin: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: false,
    });
    return Trophy;
};