import getExpFromLevel from "../../../../util/shinx/getExpFromLevel.js";
import parseMeetDate from "../../../../util/shinx/parseMeetDate.js";
import getLevelFromExp from "../../../../util/shinx/getLevelFromExp.js";

export default (sequelize, DataTypes) => {
    const MAX_RANGE = 10;
    const parseMeetDateNow = () => {
        const now = new Date();
        return parseMeetDate(now.getDate(), now.getMonth(), now.getFullYear());
    };
    const getDay = () => {
        return Math.floor(Date.now() / 86400000);
    };
    const Shinx = sequelize.define("Shinx", {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Shinx"
        },
        belly: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        shiny: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        lastmeet: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: Math.floor(Date.now() / 86400000)
        },
        meetup: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: parseMeetDateNow()
        },
        user_male: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        auto_feed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
    }, {
        timestamps: false
    });
    //  checkup
    Shinx.prototype.checkup = function () {
        const today = getDay();
        const diff = this.lastmeet - today;
        if (diff > 1) {
            this.unfeedGeneric(Math.floor(2 * diff));
            this.lastmeet = today;
            this.save({ fields: ["belly", "lastmeet"] });
        };
    };
    //  Experience
    Shinx.prototype.addExperienceGeneric = function (experience) {
        this.experience += Math.ceil(experience);
    };
    Shinx.prototype.addExperience = function (experience) {
        this.addExperienceGeneric(experience)
        this.save({ fields: ["experience"] });
    };
    Shinx.prototype.addExperienceAndLevelUp = function (experience) {
        const pre = this.getLevel();
        this.addExperience(experience);
        const post = this.getLevel();
        return { pre, post }
    };
    Shinx.prototype.getExperience = function () {
        return this.experience;
    };
    Shinx.prototype.getNextExperience = function () {
        const prev_level = Math.ceil(getExpFromLevel(this.getLevel()))
        const next_level = Math.ceil(getExpFromLevel(this.getLevel() + 1))
        return {
            exp_pts: next_level - this.experience,
            curr_percent: (this.experience - prev_level) / (next_level - prev_level)
        };
    };
    Shinx.prototype.feedAndExp = function (food) {
        const prev_level = Math.ceil(getExpFromLevel(this.getLevel()))
        const next_level = Math.ceil(getExpFromLevel(this.getLevel() + 1))
        this.addExperienceGeneric((next_level - prev_level) * (food / MAX_RANGE));
        this.feedGeneric(food);
        this.save({ fields: ["belly", "experience"] });
    };
    Shinx.prototype.addExperienceAndUnfeed = function (experience, food) {
        this.addExperienceGeneric(experience);
        this.unfeedGeneric(food);
        this.save({ fields: ["experience", "belly"] });
    };
    // Level
    Shinx.prototype.getLevel = function () {
        return getLevelFromExp(this.experience);
    };
    // Shiny 
    Shinx.prototype.switchShininessAndGet = function () {
        this.shiny = !this.shiny;
        this.save({ fields: ["shiny"] });
        return this.shiny;
    };
    // Belly
    Shinx.prototype.feedGeneric = function (amount) {
        this.belly = Math.min(MAX_RANGE, Math.max(0, this.belly) + amount);
    }
    Shinx.prototype.feed = function (amount) {
        this.feedGeneric(amount);
        this.save({ fields: ["belly"] });
    };

    Shinx.prototype.unfeedGeneric = function (amount) {
        this.belly = Math.max(0, this.belly - amount);
    };
    Shinx.prototype.unfeed = function (amount) {
        this.unfeedGeneric(amount);
        this.save({ fields: ["belly"] });
    };
    Shinx.prototype.getHunger = function () {
        return MAX_RANGE - this.belly;
    };
    Shinx.prototype.getBelly = () => {
        return this.belly;
    };
    Shinx.prototype.getBellyPercent = function () {
        return Math.round(this.belly * 100 / MAX_RANGE).toString() + "%"
    };
    Shinx.prototype.getBellyProportion = function () {
        return this.belly / MAX_RANGE
    };
    // Nickname
    Shinx.prototype.changeNick = function (nick) {
        this.nickname = nick;
        this.save({ fields: ["nickname"] });
    };
    // Gender
    Shinx.prototype.swapAndGetTrainerGender = function () {
        this.user_male = !this.user_male;
        this.save({ fields: ["user_male"] });
        return this.user_male;
    };
    // Battle
    Shinx.prototype.saveBattle = function (shinxBattle, wins) {
        this.experience = Math.floor(shinxBattle.exp * (1 + wins * 0.2));
        this.save({ fields: ["experience"] });
    };
    // Auto feed
    Shinx.prototype.setAutoFeedUnchecked = function (mode) {
        this.auto_feed = mode;
        this.save({ fields: ["auto_feed"] });
        return this.auto_feed;
    };
    Shinx.prototype.setAutoFeed = function (mode) {
        if (this.auto_feed == mode) {
            return false;
        } else {
            this.auto_feed = mode;
            this.save({ fields: ["auto_feed"] });
            return true;
        };
    };
    return Shinx;
};