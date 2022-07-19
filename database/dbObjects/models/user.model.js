module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('User', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        money: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        swcode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        birthday: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    //  Experience
    User.prototype.addMoney = function(money){
        this.money = Math.max(this.money + money, 0);
        this.save();
    }
    User.prototype.getMoney = function(){
        return this.money;
    }
    User.prototype.hasMoney = function(money){
        return this.money>=money;
    }
    User.prototype.setBirthday = function(birthday){
        this.birthday = birthday;
        this.save();
    }
    User.prototype.setSwitchCode = function(swcode){
        this.swcode = swcode;
        this.save();
    }
    return User;
};