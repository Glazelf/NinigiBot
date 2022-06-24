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

    return User;
};