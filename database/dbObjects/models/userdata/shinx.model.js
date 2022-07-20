module.exports = (sequelize, DataTypes) => {
    const MIN_RANGE = 0;
    const MAX_RANGE = 10;
    const shinx_util = require('../../../../util/nwu/shinx.util');
    const parseMeetDate = require('../../../../util/parseMeetDate');

    const parseMeetDateNow = () =>{
        const now = new Date()
        return parseMeetDate(now.getDate(), now.getMonth(), now.getFullYear())
    }

    const getDay = () =>{
        return Math.floor(Date.now() / 86400000)
    }

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
        lastmeet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Math.floor(Date.now() / (1000 * 60 * 60)),
        },
        meetup: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: parseMeetDateNow()
        },

    }, {
        timestamps: false,
    });

    //  Reset
    Shinx.prototype.reset = function(){
        this.nickname = 'Shinx';
        this.fullness = 0;
        this.experience = 0;
        this.shiny = false;
        this.meetup = parseMeetDateNow();
        this.save();
    }

    //  checkup
    Shinx.prototype.checkup = function(){
        const diff = this.lastmeet - getDay();
        if(diff>1){
            
        }

        this.experience += experience;
        this.save();
    }

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

    Shinx.prototype.getNextExperience = function(){
        const next_level = Math.ceil(shinx_util.levelToExp(this.getLevel()+1))
        return next_level - this.experience;
    }
    // Level
    Shinx.prototype.getLevel = function(){
        return Math.floor(Math.cbrt(1.25*this.experience))
    }
    // Shiny 
    Shinx.prototype.switchShininessAndGet = function(){
        this.shiny = !this.shiny;
        this.save();
        return this.shiny
    }
    // Fullness
    Shinx.prototype.feed = function(amount){
        this.fullness = Math.min(MAX_RANGE, Math.max(0, this.fullness) + amount);
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
    // Nickname
    Shinx.prototype.changeNick = function(nick){
        this.nickname = nick;
        this.save();
    }

    // Happiness
    Shinx.prototype.feed = function(amount){
        if(this.happiness<MAX_RANGE){
            this.happiness = Math.min(MAX_RANGE, this.happiness+amount);
            this.save();
            return true;
          } else {
            return false;
        }
    }
    Shinx.prototype.unfeed = function(amount){
        if(this.happiness>MIN_RANGE){
            this.happiness = Math.max(MIN_RANGE, this.happiness-amount);
            this.save();
            return true;
          } else {
            return false;
        }
    }
    return Shinx;
};