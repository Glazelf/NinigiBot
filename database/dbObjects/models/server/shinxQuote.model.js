import Sequelize from "sequelize";

export default () => {
    return Sequelize.define('shinx_quote', {
        quote: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        reaction: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};