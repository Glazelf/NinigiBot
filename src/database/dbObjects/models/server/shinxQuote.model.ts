export default (sequelize: any, DataTypes: any) => {
    return sequelize.define('shinx_quote', {
        quote: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reaction: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
    });
};