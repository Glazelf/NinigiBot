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
    }, {
        timestamps: false,
    });
    //  Money
    User.prototype.addMoney = function(money){
        this.money = Math.max(this.money + money, 0);
        this.save({fields:['money']});
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
        this.save({fields:['birthday']});
    }
    //  Switch Code
    User.prototype.setSwitchCode = function(swcode){
        this.swcode = swcode;
        this.save({fields:['swcode']});
    }
    // Food
    User.prototype.hasFood = function(food){
        return this.food>=food;
    }
    User.prototype.addFood = function(food){
        this.food = Math.max(this.food + food, 0);
        this.save({fields:['food']});
    }

    User.prototype.buyFood = function(food){
        this.money = Math.max(this.money - food, 0);
        this.food = Math.max(this.food + food, 0);
        this.save({fields:['money','food']});
    }

    User.prototype.getFood = function(){
        return this.food;
    }
    
    return User;
};