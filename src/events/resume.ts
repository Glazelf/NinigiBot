import getTime from '../util/getTime.js';

import globalVars from "../objects/globalVars.json";

export default async (client: any) => {
    try {
        // Set bot status
        client.user.setPresence(globalVars.presence);
        let timestamp = getTime();
        // console.log(`Resumed. (${timestamp})`);
        return;

    } catch (e) {
        console.log(e);
    };
};