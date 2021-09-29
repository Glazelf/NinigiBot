module.exports = (sequelize, DataTypes) => {
    return sequelize.define('server_rules', {
        server_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rule_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rule_title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rule_body: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};