module.exports = (sequelize, DataTypes) => {

    const Trainer = sequelize.define('Trainer', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
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

    // Food
    Trainer.prototype.hasFood = function(food){
        return this.food>=food;
    }
    Trainer.prototype.addFood = function(food){
        this.food = Math.max(this.food + food, 0);
        this.save();
    }
    Trainer.prototype.getFood = function(){
        return this.food;
    }
    // Gender
    Trainer.prototype.swapAndGetGender = function(){
        this.is_male = !this.is_male;
        this.save();
        return this.is_male;
    }

    return Trainer;
};