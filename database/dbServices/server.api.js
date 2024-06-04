import { serverdata } from "../../database/dbConnection/dbConnection.js";
import serverdataModel from "../../database/dbObjects/serverdata.model.js";

export default async () => {
    const serverData = { shinxQuotes, EligibleRoles, PersonalRoles, PersonalRoleServers, LogChannels, StarboardChannels, StarboardMessages, StarboardLimits, ModEnabledServers } = await serverdataModel(serverdata);
    return serverData;
};