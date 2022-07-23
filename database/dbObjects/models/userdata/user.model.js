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
        food: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        is_male: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
    //  Money
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
    //  Birthday
    User.prototype.setBirthday = function(birthday){
        this.birthday = birthday;
        this.save();
    }
    //  Switch Code
    User.prototype.setSwitchCode = function(swcode){
        this.swcode = swcode;
        this.save();
    }
    // Food
    User.prototype.hasFood = function(food){
        return this.food>=food;
    }
    User.prototype.addFood = function(food){
        this.food = Math.max(this.food + food, 0);
        this.save();
    }
    User.prototype.getFood = function(){
        return this.food;
    }
    // Gender
    User.prototype.swapAndGetGender = function(){
        this.is_male = !this.is_male;
        this.save();
        return this.is_male;
    }
    return User;
};