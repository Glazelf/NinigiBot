module.exports = (sequelize, DataTypes) => {

    const Badge = sequelize.define('EventBadge', {
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
        origin : {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    
    return Badge;
};