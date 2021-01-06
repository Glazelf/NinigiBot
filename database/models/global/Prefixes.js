module.exports = (sequelize, DataTypes) => {
    return sequelize.define('prefixes', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prefix: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};