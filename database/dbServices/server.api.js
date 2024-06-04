import Sequelize from "sequelize";
const { serverdata } = require('../../database/dbConnection/dbConnection');
const { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers } = require('../../database/dbObjects/serverdata.model')(serverdata);

export default { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };