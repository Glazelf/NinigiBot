import shinxModel from "./models/userdata/shinx.model.js";
import userModel from "./models/userdata/user.model.js";
import historyModel from "./models/userdata/history.model.js";
import eventTrophyModel from "./models/items/eventTrophy.model.js";
import shopTrophyModel from "./models/items/shopTrophy.model.js";
import { DataTypes } from "sequelize";

export default async (sequelize) => {
    const Shinx = shinxModel(sequelize, DataTypes);
    const User = userModel(sequelize, DataTypes);
    const History = historyModel(sequelize, DataTypes);
    const EventTrophy = eventTrophyModel(sequelize, DataTypes);
    const ShopTrophy = shopTrophyModel(sequelize, DataTypes);
    // https://sequelize.org/docs/v7/core-concepts/assocs/#foobelongstomanybar--through-baz-
    User.belongsToMany(EventTrophy, { through: "EventTrophyUser", timestamps: false });
    EventTrophy.belongsToMany(User, { through: "EventTrophyUser", timestamps: false });
    User.belongsToMany(ShopTrophy, { through: "ShopTrophyUser", timestamps: false });
    ShopTrophy.belongsToMany(User, { through: "ShopTrophyUser", timestamps: false });
    User.hasOne(Shinx, { foreignKey: "user_id" });
    User.hasOne(History, { foreignKey: "user_id" });
    sequelize.sync();
    return { Shinx, User, EventTrophy, ShopTrophy, History };
};