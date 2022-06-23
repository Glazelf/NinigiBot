module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
        user_id: DataTypes.STRING,
        money: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        food: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    
    return User;
};