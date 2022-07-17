module.exports = (sequelize, DataTypes) => {

    const Trophy = sequelize.define('shopTrophy', {
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
        },
        origin : {
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
    
    return Trophy;
};