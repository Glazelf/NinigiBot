module.exports = (sequelize, DataTypes) => {
    const MIN_RANGE = 0;
    const MAX_RANGE = 10;


    const Shinx = sequelize.define('Shinx', {
        user_id: DataTypes.STRING,
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Shinx',
        },
        fullness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        happiness: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    //  Experience
    Shinx.prototype.addExperience = function(experience){
        this.experience += experience;
    }
    Shinx.prototype.getExperience = function(){
        return this.experience;
    }
    
    Shinx.prototype.getLevel = function(){
        return Math.floor(Math.cbrt(1.25*this.experience))
    }
    // Fullness
    Shinx.prototype.feed = function(amount){
        if(this.fullness<MAX_RANGE){
            this.fullness = Math.min(MAX_RANGE, this.fullness+amount);
            return true;
          } else {
            return false;
        }
    }
    Shinx.prototype.unfeed = function(amount){
        if(this.fullness>MIN_RANGE){
            this.fullness = Math.max(MIN_RANGE, this.fullness-amount);
            return true;
          } else {
            return false;
        }
    }

    Shinx.prototype.getFullness = function(){
        this.fullness
    }
    // Happiness
    Shinx.prototype.addHappiness = function(amount){
        if(this.happiness<MAX_RANGE){
            this.happiness = Math.min(MAX_RANGE, this.happiness+amount);
            return true;
          } else {
            return false;
        }
    }
    Shinx.prototype.removeHappiness = function(amount){
        if(this.happiness>MIN_RANGE){
            this.happiness = Math.max(MIN_RANGE, this.happiness-amount);
            return true;
          } else {
            return false;
        }
    }

    Shinx.prototype.getHappiness = function(){
        this.happiness
    }

    return Shinx;
};