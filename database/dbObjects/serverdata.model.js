import Sequelize from "sequelize";
import shinxQuoteModel from "./models/server/shinxQuote.model";
import eligibleRolesModel from "./models/server/eligibleRoles.model";
import personalRolesModel from "./models/server/personalRoles.model";
import personalRoleServersModel from "./models/global/personalRoleServers.model";
import modEnabledServersModel from "./models/global/modEnabledServers.model";
import logChannelsModel from "./models/global/logChannels.model";
import starboardChannelsModel from "./models/global/starboardChannels.model";
import starboardMessagesModel from "./models/global/starboardMessages.model";
import starboardLimitsModel from "./models/server/starboardLimits.model";

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