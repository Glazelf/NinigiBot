import { serverdata } from "../../database/dbConnection/dbConnection.js";
import serverdatamodel from "../../database/dbObjects/serverdata.model.js";

export default async () => {
    const serverData = await serverdataModel(serverdata);
    return serverData;
};