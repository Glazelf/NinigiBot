module.exports = (sequelize, DataTypes) => {

    const Badge = sequelize.define('shopBadge', {
		badge_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        icon: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    
    return Badge;
};