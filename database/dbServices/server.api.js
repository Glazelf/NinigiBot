import { serverdata } from "../../database/dbConnection/dbConnection";
import serverdataModel from "../../database/dbObjects/serverdata.model"

const { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers } = serverdataModel(serverdata);

export default { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers };