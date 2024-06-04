import Sequelize from 'sequelize';

export default () => {
    return sequelize.define('eligible_roles', {
        role_id: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false,
    });
};