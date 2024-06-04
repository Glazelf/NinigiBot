import Sequelize from "sequelize";
import shinxQuoteModel from "./models/server/shinxQuote.model.js";
import eligibleRolesModel from "./models/server/eligibleRoles.model.js";
import personalRolesModel from "./models/server/personalRoles.model.js";
import personalRoleServersModel from "./models/global/personalRoleServers.model.js";
import modEnabledServersModel from "./models/global/modEnabledServers.model.js";
import logChannelsModel from "./models/global/logChannels.model.js";
import starboardChannelsModel from "./models/global/starboardChannels.model.js";
import starboardMessagesModel from "./models/global/starboardMessages.model.js";
import starboardLimitsModel from "./models/server/starboardLimits.model.js";

export default () => {
    const shinxQuotes = shinxQuoteModel();
    const EligibleRoles = eligibleRolesModel();
    const PersonalRoles = personalRolesModel();
    const PersonalRoleServers = personalRoleServersModel();
    const ModEnabledServers = modEnabledServersModel();
    const LogChannels = logChannelsModel();
    const StarboardChannels = starboardChannelsModel();
    const StarboardMessages = starboardMessagesModel();
    const StarboardLimits = starboardLimitsModel();
    Sequelize.sync();
    return { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };
};