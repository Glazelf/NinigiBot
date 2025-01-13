export default (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true
        },
        money: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        swcode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        birthday: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ephemeral_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        food: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {
        timestamps: false
    });
    // Money
    User.prototype.addMoneyGeneric = function (money) {
        this.money = Math.max(this.money + money, 0);
    };
    User.prototype.addMoney = function (money) {
        this.addMoneyGeneric(money);
        this.save({ fields: ["money"] });
    };
    User.prototype.getMoney = function () {
        return this.money;
    };
    User.prototype.hasMoney = function (money) {
        return this.money >= money;
    };
    // Birthday
    User.prototype.setBirthday = function (birthday) {
        this.birthday = birthday;
        this.save({ fields: ["birthday"] });
    };
    // Switch Code
    User.prototype.setSwitchCode = function (swcode) {
        this.swcode = swcode;
        this.save({ fields: ["swcode"] });
    };
    // Ephemeral default
    User.prototype.setEphemeralDefault = function (ephemeral_default) {
        this.ephemeral_default = ephemeral_default;
        this.save({ fields: ["ephemeral_default"] });
    };
    // Food
    User.prototype.hasFood = function (food) {
        return this.food >= food;
    };
    User.prototype.addFoodGeneric = function (food) {
        this.food = Math.max(this.food + food, 0);
    };
    User.prototype.addFood = function (food) {
        this.addFoodGeneric(food);
        this.save({ fields: ["food"] });
    };
    User.prototype.buyFood = function (food) {
        this.addMoneyGeneric(-food);
        this.addFoodGeneric(food);
        this.save({ fields: ["money", "food"] });
    };
    User.prototype.reduceFoodMoney = function (food, money) {
        if (food != 0 && money != 0) {
            this.addMoneyGeneric(-money);
            this.addFoodGeneric(-food);
            this.save({ fields: ["money", "food"] });
        } else if (food == 0) {
            this.addMoney(-money);
        } else {
            this.addFood(-food);
        };
    };
    User.prototype.getFood = function () {
        return this.food;
    };
    return User;
};