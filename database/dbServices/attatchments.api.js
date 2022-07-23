const Sequelize = require('sequelize');
const {attatchments  } =  require('../../database/dbConnection/dbConnection');
const {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers} = require('../../database/dbObjects/server.model')(attatchments, Sequelize.DataTypes);


module.exports = {shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers};
