module.exports = (sequelize, DataTypes) => {

    const Trophy = sequelize.define('Trophy', {
		trophy_id: {
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
        }
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    
    return Trophy;
};