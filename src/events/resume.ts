import type { ExtendedClient, GlobalVars } from '../types/global.js';
import globalVarsJson from "../objects/globalVars.json" with { type: "json" };

const globalVars = globalVarsJson as GlobalVars;

export default async (client: ExtendedClient) => {
    try {
        // Set bot status
        if (globalVars.presence) {
            client.user.setPresence(globalVars.presence);
        }
        // console.log(`Resumed. (${timestamp})`);
        return;

    } catch (e: any) {
        console.log(e);
    };
};