module.exports = (sequelize, DataTypes) => {

	const shinxQuotes = require('./dbObjects/models/attachments/shinxQuotes')(attatchments, Sequelize.DataTypes);

	const EligibleRoles = require('./models/server/EligibleRoles')(sequelize, Sequelize.DataTypes);
	const PersonalRoles = require('./models/server/PersonalRoles')(sequelize, Sequelize.DataTypes);
	const PersonalRoleServers = require('./models/global/PersonalRoleServers')(sequelize, Sequelize.DataTypes);
	const ModEnabledServers = require('./models/global/ModEnabledServers')(sequelize, Sequelize.DataTypes);
	const LogChannels = require('./models/global/LogChannels')(sequelize, Sequelize.DataTypes);
	const StarboardChannels = require('./models/global/StarboardChannels')(sequelize, Sequelize.DataTypes);
	const StarboardMessages = require('./models/global/StarboardMessages')(sequelize, Sequelize.DataTypes);
	const StarboardLimits = require('./models/server/StarboardLimits')(sequelize, Sequelize.DataTypes);
	
	sequelize.sync();
	return {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers};
}