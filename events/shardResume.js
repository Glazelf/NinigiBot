import getTime from '../util/getTime.js';

export default async (client, id) => {
    try {
        // Set bot status
        client.user.setPresence(client.globalVars.presence);
        let timestamp = await getTime();
        // console.log(`Reconnected shard ${id}. (${timestamp})`);
        return;

    } catch (e) {
        console.log(e);
    };
};