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
        food: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        // new_achievement: {
        //     type: DataTypes.BOOLEAN,
        //     allowNull: false,
        //     defaultValue: false,
        // }
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

    // User.prototype.setAchievementFlag = () =>{
    //     if(!this.new_achievement){
    //         this.new_achievement = true;
    //         this.save()
    //     }
    // }

    // User.prototype.removeAchievementFlag = () =>{
    //     if(this.new_achievement){
    //         this.new_achievement = false;
    //         this.save()
    //     }
    // }

    return User;
};