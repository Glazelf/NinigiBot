import type { ExtendedClient } from '../types/global.js';
import globalVars from "../objects/globalVars.json" with { type: "json" };

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