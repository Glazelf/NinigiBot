module.exports = (sequelize, DataTypes) => {
    const shinxQuotes = require('./models/server/shinxQuote.model')(sequelize, DataTypes);
    const EligibleRoles = require('./models/server/eligibleRoles.model')(sequelize, DataTypes);
    const PersonalRoles = require('./models/server/personalRoles.model')(sequelize, DataTypes);
    const PersonalRoleServers = require('./models/global/personalRoleServers.model')(sequelize, DataTypes);
    const ModEnabledServers = require('./models/global/modEnabledServers.model')(sequelize, DataTypes);
    const LogChannels = require('./models/global/logChannels.model')(sequelize, DataTypes);
    const StarboardChannels = require('./models/global/starboardChannels.model')(sequelize, DataTypes);
    const StarboardMessages = require('./models/global/starboardMessages.model')(sequelize, DataTypes);
    const StarboardLimits = require('./models/server/starboardLimits.model')(sequelize, DataTypes);
    sequelize.sync();
    return { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };
};