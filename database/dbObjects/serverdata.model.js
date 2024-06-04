import shinxQuoteModel from "./models/server/shinxQuote.model.js";
import eligibleRolesModel from "./models/server/eligibleRoles.model.js";
import personalRolesModel from "./models/server/personalRoles.model.js";
import personalRoleServersModel from "./models/global/personalRoleServers.model.js";
import modEnabledServersModel from "./models/global/modEnabledServers.model.js";
import logChannelsModel from "./models/global/logChannels.model.js";
import starboardChannelsModel from "./models/global/starboardChannels.model.js";
import starboardMessagesModel from "./models/global/starboardMessages.model.js";
import starboardLimitsModel from "./models/server/starboardLimits.model.js";
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const shinxQuotes = shinxQuoteModel(sequelize, DataTypes);
    const EligibleRoles = eligibleRolesModel(sequelize, DataTypes);
    const PersonalRoles = personalRolesModel(sequelize, DataTypes);
    const PersonalRoleServers = personalRoleServersModel(sequelize, DataTypes);
    const ModEnabledServers = modEnabledServersModel(sequelize, DataTypes);
    const LogChannels = logChannelsModel(sequelize, DataTypes);
    const StarboardChannels = starboardChannelsModel(sequelize, DataTypes);
    const StarboardMessages = starboardMessagesModel(sequelize, DataTypes);
    const StarboardLimits = starboardLimitsModel(sequelize, DataTypes);
    sequelize.sync();
    return { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };
};