import Sequelize from 'sequelize';

export default () => {
    const Trophy = Sequelize.define('shopTrophy', {
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
        price: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
        },

    }, {
        timestamps: false,
    });
    return Trophy;
};