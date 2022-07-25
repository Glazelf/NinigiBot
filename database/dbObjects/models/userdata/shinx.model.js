module.exports = (sequelize, DataTypes) => {
    const MIN_RANGE = 0;
    const MAX_RANGE = 10;
    const KILL_VALUE = 20;
    const shinx_util = require('../../../../util/nwu/shinx.util');
    const parseMeetDate = require('../../../../util/shinx/parseMeetDate');
    const getLevelFromExp = require('../../../../util/shinx/getLevelFromExp');

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
            defaultValue: 1,
        },
        shiny: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        lastmeet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Math.floor(Date.now() / 86400000),
        },
        meetup: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: parseMeetDateNow()
        },
        user_male: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
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
            this.fullness -= Math.floor(diff/3);
            if(this.fullness*-1 < KILL_VALUE){
                this.reset();
                return false;
            } else {
                this.save();
                return true;
            }
        }
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
        const prev_level = Math.ceil(shinx_util.levelToExp(this.getLevel()))
        const next_level = Math.ceil(shinx_util.levelToExp(this.getLevel()+1))
        return {
            exp_pts : next_level - this.experience, 
            curr_percent : (this.experience - prev_level)/(next_level-prev_level)
        };
    }
    // Level
    Shinx.prototype.getLevel = function(){
        return getLevelFromExp(this.experience);
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

    Shinx.prototype.unfeed = function(amount){
        this.fullness -= amount;
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
    Shinx.prototype.getFullnessProportion = function(){
        return this.fullness/MAX_RANGE
    }

    // Nickname
    Shinx.prototype.changeNick = function(nick){
        this.nickname = nick;
        this.save();
    }
    // Gender
    Shinx.prototype.swapAndGetTrainerGender = function(){
        this.user_male = !this.user_male;
        this.save();
        return this.user_male;
    }
    // Battle
    Shinx.prototype.saveBattle = function(shinxBattle, wins){
        this.experience = shinxBattle.exp * (1 + wins*0.2);
        this.save();
    }

    return Shinx;
};