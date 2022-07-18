module.exports = (sequelize, DataTypes) => {
    const MIN_RANGE = 0;
    const MAX_RANGE = 10;
    const shinx_util = require('../../../utils/shinx.util')

    const Shinx = sequelize.define('Shinx', {
        user_id: {
            type : DataTypes.STRING,
            primaryKey: true
        },
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
        shiny: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

    }, {
        timestamps: false,
    });
    // Class Methods

    // Instance Methods
    //  Experience
    Shinx.prototype.addExperience = function(experience){
        this.experience += experience;
        this.save();
    }
    Shinx.prototype.addExperienceAndLevelUp = function(experience){
        const pre = this.getLevel();
        this.addExperience(experience);
        const post = this.getLevel();
        return {pre, post}

    }
    Shinx.prototype.getExperience = function(){
        return this.experience;
    }
    Shinx.prototype.switchShininessAndGet = function(){
        this.shiny = !this.shiny;
        this.save();
        return this.shiny
    }

    Shinx.prototype.getNextExperience = function(){
        const next_level = Math.ceil(shinx_util.levelToExp(this.getLevel()+1))
        return next_level - this.experience;
    }
    Shinx.prototype.getLevel = function(){
        return Math.floor(Math.cbrt(1.25*this.experience))
    }
    // Fullness
    Shinx.prototype.feed = function(amount){
        this.fullness = Math.min(MAX_RANGE, this.fullness+amount);
        this.save();
    }

    // Nickname
    Shinx.prototype.changeNick = function(nick){
        this.nickname = nick;
        this.save();
    }

    Shinx.prototype.getHunger = function(){
        return MAX_RANGE - this.fullness;
    }

    Shinx.prototype.getFullness = function(){
        return this.fullness
    }
    Shinx.prototype.getFullnessPercent = function(){
        return Math.round(this.fullness*100/MAX_RANGE).toString()+'%'
    }
    Shinx.prototype.getHappinessPercent = function(){
        return Math.round(this.happiness*100/MAX_RANGE).toString()+'%'
    }
    // Happiness
    Shinx.prototype.addHappiness = function(amount){
        if(this.happiness<MAX_RANGE){
            this.happiness = Math.min(MAX_RANGE, this.happiness+amount);
            this.save();
            return true;
          } else {
            return false;
        }
    }
    Shinx.prototype.removeHappiness = function(amount){
        if(this.happiness>MIN_RANGE){
            this.happiness = Math.max(MIN_RANGE, this.happiness-amount);
            this.save();
            return true;
          } else {
            return false;
        }
    }

    Shinx.prototype.getHappiness = function(){
        return this.happiness
    }

    return Shinx;
};