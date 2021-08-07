module.exports = (sequelize, DataTypes) => {
    return sequelize.define('mod_enabled_servers', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};