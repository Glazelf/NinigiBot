import { serverdata } from "../../database/dbConnection/dbConnection.js";
import serverdataModel from "../../database/dbObjects/serverdata.model.js"

const { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers } = serverdataModel(serverdata);

export default { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };