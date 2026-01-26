
import { DataTypes } from "sequelize";

export default async (sequelize) => {
    const shinxModel = await import("./models/userdata/shinx.model.js");
    const userModel = await import("./models/userdata/user.model.js");
    const historyModel = await import("./models/userdata/history.model.js");
    const eventTrophyModel = await import("./models/items/eventTrophy.model.js");
    const shopTrophyModel = await import("./models/items/shopTrophy.model.js");
    const Shinx = shinxModel.default(sequelize, DataTypes);
    const User = userModel.default(sequelize, DataTypes);
    const History = historyModel.default(sequelize, DataTypes);
    const EventTrophy = eventTrophyModel.default(sequelize, DataTypes);
    const ShopTrophy = shopTrophyModel.default(sequelize, DataTypes);
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