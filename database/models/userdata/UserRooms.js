module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_room', {
        user_id: DataTypes.STRING,
        item_id: DataTypes.STRING,
        items: {
            type: DataTypes.STRING,
            allowNull: false,
            'default': '',
        },
    }, {
        timestamps: false,
    });
};