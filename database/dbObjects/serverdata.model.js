export default (sequelize, DataTypes) => {
    const shinxQuotes = require('./models/server/shinxQuote.model')();
    const EligibleRoles = require('./models/server/eligibleRoles.model')();
    const PersonalRoles = require('./models/server/personalRoles.model')();
    const PersonalRoleServers = require('./models/global/personalRoleServers.model')();
    const ModEnabledServers = require('./models/global/modEnabledServers.model')();
    const LogChannels = require('./models/global/logChannels.model')();
    const StarboardChannels = require('./models/global/starboardChannels.model')();
    const StarboardMessages = require('./models/global/starboardMessages.model')();
    const StarboardLimits = require('./models/server/starboardLimits.model')();
    sequelize.sync();
    return { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };
};