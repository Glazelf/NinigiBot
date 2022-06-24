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
        this.money += money;
    }
    User.prototype.getMoney = function(){
        return this.money;
    }
    User.prototype.addFood = function(food){
        this.food += food;
    }
    User.prototype.getFood = function(){
        return this.food;
    }

    return User;
};