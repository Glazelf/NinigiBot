const Sequelize = require('sequelize');
const {serverdata  } =  require('../../database/dbConnection/dbConnection');
const {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers} = require('../../database/dbObjects/server.model')(serverdata, Sequelize.DataTypes);


module.exports = {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers};
