import Sequelize from "sequelize";
import shinxModel from "./models/userdata/shinx.model.js";
import userModel from "./models/userdata/user.model.js";
import historyModel from "./models/userdata/history.model.js";
import eventTrophyModel from "./models/items/eventTrophy.model.js";
import shopTrophyModel from "./models/items/shopTrophy.model.js";

export default async () => {
    const Shinx = shinxModel();
    const User = userModel();
    const History = historyModel();
    const EventTrophy = eventTrophyModel();
    const ShopTrophy = shopTrophyModel();
    // https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
    User.belongsToMany(EventTrophy, { through: "EventTrophyUser", timestamps: false });
    EventTrophy.belongsToMany(User, { through: "EventTrophyUser", timestamps: false });
    User.belongsToMany(ShopTrophy, { through: "ShopTrophyUser", timestamps: false });
    ShopTrophy.belongsToMany(User, { through: "ShopTrophyUser", timestamps: false });
    User.hasOne(Shinx, { foreignKey: "user_id" });
    User.hasOne(History, { foreignKey: "user_id" });
    Sequelize.sync();
    return { Shinx, User, EventTrophy, ShopTrophy, History };
};