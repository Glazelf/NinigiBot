import getTime from '../util/getTime';

export default async (client) => {
    try {
        // Set bot status
        client.user.setPresence(client.globalVars.presence);
        let timestamp = await getTime(client);
        // console.log(`Resumed. (${timestamp})`);
        return;

    } catch (e) {
        // Log error
        console.log(e);
    };
};