import { DataTypes } from "sequelize";

export default async (sequelize) => {
    const shinxQuoteModel = await import("./models/server/shinxQuote.model.js");
    const eligibleRolesModel = await import("./models/server/eligibleRoles.model.js");
    const personalRolesModel = await import("./models/server/personalRoles.model.js");
    const personalRoleServersModel = await import("./models/global/personalRoleServers.model.js");
    const modEnabledServersModel = await import("./models/global/modEnabledServers.model.js");
    const logChannelsModel = await import("./models/global/logChannels.model.js");
    const starboardChannelsModel = await import("./models/global/starboardChannels.model.js");
    const starboardMessagesModel = await import("./models/global/starboardMessages.model.js");
    const starboardLimitsModel = await import("./models/server/starboardLimits.model.js");
    const shinxQuotes = shinxQuoteModel.default(sequelize, DataTypes);
    const EligibleRoles = eligibleRolesModel.default(sequelize, DataTypes);
    const PersonalRoles = personalRolesModel.default(sequelize, DataTypes);
    const PersonalRoleServers = personalRoleServersModel.default(sequelize, DataTypes);
    const ModEnabledServers = modEnabledServersModel.default(sequelize, DataTypes);
    const LogChannels = logChannelsModel.default(sequelize, DataTypes);
    const StarboardChannels = starboardChannelsModel.default(sequelize, DataTypes);
    const StarboardMessages = starboardMessagesModel.default(sequelize, DataTypes);
    const StarboardLimits = starboardLimitsModel.default(sequelize, DataTypes);
    sequelize.sync();
    return { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };
};