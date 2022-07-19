module.exports = (sequelize, DataTypes) => {

	const shinxQuotes = require('./dbObjects/models/attachments/shinxQuotes')(attatchments, Sequelize.DataTypes);

	const EligibleRoles = require('./models/server/eligibleRoles.model')(sequelize, Sequelize.DataTypes);
	const PersonalRoles = require('./models/server/personalRoles.model')(sequelize, Sequelize.DataTypes);
	const PersonalRoleServers = require('./models/global/personalRoleServers.model')(sequelize, Sequelize.DataTypes);
	const ModEnabledServers = require('./models/global/modEnabledServers.model')(sequelize, Sequelize.DataTypes);
	const LogChannels = require('./models/global/logChannels.model')(sequelize, Sequelize.DataTypes);
	const StarboardChannels = require('./models/global/starboardChannels.model')(sequelize, Sequelize.DataTypes);
	const StarboardMessages = require('./models/global/starboardMessages.model')(sequelize, Sequelize.DataTypes);
	const StarboardLimits = require('./models/server/starboardLimits.model')(sequelize, Sequelize.DataTypes);
	
	sequelize.sync();
	return {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers};
}