const Sequelize = require('sequelize');
const config = require('../config.json');

const sequelize = new Sequelize('database', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/database.sqlite',
});

const attatchments = new Sequelize('attatchments', config.dbUsername, config.dbPassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/models/attachments/attachments.sqlite',
});

const levelExp = (lvl) => {
    return (6 / 5) * (lvl) ** 3 - 15 * (lvl) ** 2 + 100 * lvl - 140;
};
const shinxQuotes = require('./models/attachments/shinxQuotes')(attatchments, Sequelize.DataTypes);
const Users = require('./models/userdata/Users')(sequelize, Sequelize.DataTypes);
const Shinx = require('./models/userdata/Shinx')(sequelize, Sequelize.DataTypes)
const Equipments = require('./models/data/Equipments')(sequelize, Sequelize.DataTypes)
const Foods = require('./models/data/Foods')(sequelize, Sequelize.DataTypes)
const KeyItems = require('./models/data/KeyItems')(sequelize, Sequelize.DataTypes)
//const Room = require('./models/data/Room')(sequelize, Sequelize.DataTypes)
const CurrencyShop = require('./models/data/CurrencyShop')(sequelize, Sequelize.DataTypes);

const UserItems = require('./models/userdata/UserItems')(sequelize, Sequelize.DataTypes);
const UserEquipments = require('./models/userdata/UserEquipments')(sequelize, Sequelize.DataTypes);
const UserFoods = require('./models/userdata/UserFoods')(sequelize, Sequelize.DataTypes);
const UserKeys = require('./models/userdata/UserKeys')(sequelize, Sequelize.DataTypes);
//const UserRooms = require('./models/userdata/UserRooms')(sequelize, Sequelize.DataTypes);

const EligibleRoles = require('./models/server/EligibleRoles')(sequelize, Sequelize.DataTypes);
const DisabledChannels = require('./models/server/DisabledChannels')(sequelize, Sequelize.DataTypes);
const PersonalRoles = require('./models/server/PersonalRoles')(sequelize, Sequelize.DataTypes);
const PersonalRoleServers = require('./models/global/PersonalRoleServers')(sequelize, Sequelize.DataTypes);
const ModEnabledServers = require('./models/global/ModEnabledServers')(sequelize, Sequelize.DataTypes);
const LogChannels = require('./models/global/LogChannels')(sequelize, Sequelize.DataTypes);
const StarboardChannels = require('./models/global/StarboardChannels')(sequelize, Sequelize.DataTypes);
const StarboardMessages = require('./models/global/StarboardMessages')(sequelize, Sequelize.DataTypes);
const StarboardLimits = require('./models/server/StarboardLimits')(sequelize, Sequelize.DataTypes);
const VCTextChannels = require('./models/global/VCTextChannels')(sequelize, Sequelize.DataTypes);
const Prefixes = require('./models/global/Prefixes')(sequelize, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });
UserEquipments.belongsTo(Equipments, { foreignKey: 'item_id', as: 'equipment' });
UserFoods.belongsTo(Foods, { foreignKey: 'item_id', as: 'food' });
UserKeys.belongsTo(KeyItems, { foreignKey: 'item_id', as: 'key' });
//UserRooms.belongsTo(Room, { foreignKey: 'item_id', as: 'room' });

const numberParser = require('../util/parseInteger')
CurrencyShop.prototype.toString = function () {
    return `${this.name}: ${this.cost}💰, ${this.usage}`
};

Equipments.prototype.toString = function () {
    let food = numberParser(this.food * 100);
    let sleep = numberParser(this.sleep * 100);
    let friendship = numberParser(this.friendship * 100);
    let description = `${this.name}: ${this.cost}💰,`;
    if (this.regen) description += ` recovers ${this.regen * 100}% points per turn,`;
    if (this.food) description += ` ${food}% food,`;
    if (this.sleep) description += ` ${sleep}% sleep,`;
    if (this.friendship) description += ` ${friendship}% friendship,`;
    if (this.guard) description += ` blocks one deathblow,`;
    if (this.safeguard) description += ` blocks all deathblows,`;
    if (this.geass) description += ` turn one geass,`;
    if (this.ultrageass) description += ` permanent geass,`;
    return description.slice(0, -1);
};

KeyItems.prototype.toString = function () {
    let description = `${this.name}: ${this.cost}💰`;
    return description;
};

Foods.prototype.toString = function () {
    let description = `${this.name}: ${this.cost}💰, recovers ${this.recovery * 100} points`;
    return description;
};

Shinx.prototype.levelUp = function (levels) {
    this.level = Math.max(1, this.level + levels);
    this.exp = levelExp(this.level)
    this.save();
    return this.level;
};

Shinx.prototype.changeNick = function (newNick) {
    this.nick = newNick;
    this.save();
    return this.nick;
};

Shinx.prototype.play = function (amount) {
    this.varyFriendship(0.05 * amount);
    this.varySleep(-0.01);
    this.varyHunger(-0.15);
    this.save();
};

Shinx.prototype.feed = function (amount) {
    this.varyHunger(amount);
    this.varySleep(-0.01);
    this.save();
};

Shinx.prototype.varyHunger = function (amount) {
    this.hunger = Math.max(Math.min(1, this.hunger + amount), 0);
};

Shinx.prototype.varySleep = function (amount) {
    this.sleep = Math.max(Math.min(1, this.sleep + amount), 0);
};

Shinx.prototype.varyFriendship = function (amount) {
    this.friendship = Math.max(Math.min(1, this.friendship + amount), 0);
};

Shinx.prototype.shine = function () {
    this.shiny = !this.shiny;
    this.save();
    return this.shiny;
};

Shinx.prototype.rest = function () {
    this.sleeping = !this.sleeping;
    this.save();
};

Shinx.prototype.see = function () {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
    const hoursPassed = currentHour - this.lastmeet;
    if (this.sleep === 0) this.sleeping = true;
    if (hoursPassed === 0) return;
    if (this.sleeping) this.varySleep(hoursPassed * 2);
    else this.varySleep(-hoursPassed * 0.001);
    if (this.sleep === 1) this.sleeping = false;
    if (this.sleep === 0) this.sleeping = true;
    this.varyHunger(-hoursPassed * 0.01);
    if (hoursPassed >= 7 * 24) this.varyFriendship(-0.1 * Math.trunc(hoursPassed / 7 * 24));
    this.lastmeet = currentHour;
    this.save();
    return this.sleeping;
};

Shinx.prototype.trans = function () {
    this.user_male = !this.user_male;
    this.save();
    return this.user_male;
};

Shinx.prototype.updateData = function (shinxBattle, wins = false) {
    this.level = shinxBattle.level;
    this.exp = shinxBattle.exp;
    this.varyHunger(-0.1);
    this.varySleep(-0.1);
    wins ? this.varyFriendship(0.04) : this.varyFriendship(-0.02);
    this.save();
};

Shinx.prototype.equip = function (equipment) {
    this.equipment = equipment;
    this.save();
};

Users.prototype.addItem = async function (item) {
    const useritem = await UserItems.findOne({
        where: { user_id: this.user_id, item_id: item.id },
    });
    if (useritem) {
        useritem.amount += 1;
        return useritem.save();
    };
    return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
};

Users.prototype.removeItem = async function (item) {
    const useritem = await UserItems.findOne({
        where: { user_id: this.user_id, item_id: item.id },
    });

    if (useritem) {
        useritem.amount -= 1;
        if (useritem.amount === 0) {
            useritem.destroy();
        } else {
            useritem.save();
        };
        return true;
    };
    return false;
};

Users.prototype.getItems = function () {
    return UserItems.findAll({
        where: { user_id: this.user_id },
        include: ['item'],
    });
};

Users.prototype.addFood = async function (food) {
    const userfood = await UserFoods.findOne({
        where: { user_id: this.user_id, item_id: food.id },
    });

    if (userfood) {
        userfood.amount += 1;
        return userfood.save();
    };

    return UserFoods.create({ user_id: this.user_id, item_id: food.id, amount: 1 });
};

Users.prototype.removeFood = async function (food) {
    const userfood = await UserFoods.findOne({
        where: { user_id: this.user_id, item_id: food.id },
    });

    if (userfood) {
        userfood.amount -= 1;
        if (userfood.amount === 0) {
            userfood.destroy();
        } else {
            userfood.save();
        };
        return true;
    };
    return false;
};

Users.prototype.getFoods = function () {
    return UserFoods.findAll({
        where: { user_id: this.user_id },
        include: ['food'],
    });
};

Users.prototype.removeEquipment = async function (equipment) {
    const userequipment = await UserEquipments.findOne({
        where: { user_id: this.user_id, item_id: equipment.id },
    });

    if (userequipment) {
        return userequipment.destroy();
    };
};

Users.prototype.addEquipment = async function (equipment) {
    const userequipment = await UserEquipments.findOne({
        where: { user_id: this.user_id, item_id: equipment.id },
    });

    if (!userequipment) {
        return UserEquipments.create({ user_id: this.user_id, item_id: equipment.id, amount: 1 });
    };
};

Users.prototype.getEquipments = function () {
    return UserEquipments.findAll({
        where: { user_id: this.user_id },
        include: ['equipment'],
    });
};
Users.prototype.addKey = async function (key) {
    const userkey = await UserKeys.findOne({
        where: { user_id: this.user_id, item_id: key.id },
    });

    if (!userkey) {
        return UserKeys.create({ user_id: this.user_id, item_id: key.id });
    };
};

Users.prototype.removeKey = async function (key) {
    const userkey = await UserKeys.findOne({
        where: { user_id: this.user_id, item_id: key.id },
    });

    if (userkey) {
        userkey.destroy();
        return true;
    };
    return false;
};

Users.prototype.getKeys = function () {
    return UserKeys.findAll({
        where: { user_id: this.user_id },
        include: ['key'],
    });
};

Users.prototype.changeRoom = async function (room) {
    const useroom = await UserRooms.findOne({
        where: { user_id: this.user_id },
    });
    if (!userequipment) {
        return UserEquipments.create({ user_id: this.user_id, item_id: room.id });
    };
    useroom.item_id = room.id;
    useroom.items = '';
    useroom.save();
};

Users.prototype.getRoom = function () {
    return UserRooms.findOne({
        where: { user_id: this.user_id },
        include: ['room'],
    });
};

module.exports = { shinxQuotes, Users, Equipments, Foods, KeyItems, CurrencyShop, UserItems, UserEquipments, UserFoods, UserKeys, EligibleRoles, DisabledChannels, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, VCTextChannels, Prefixes, ModEnabledServers, Shinx };
