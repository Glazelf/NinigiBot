export default async (client, id) => {
    try {
        import Discord from "discord.js";
        const getTime = require('../util/getTime');
        // Set bot status
        client.user.setPresence(client.globalVars.presence);

        let timestamp = await getTime();
        // Console log status
        // console.log(`Reconnected shard ${id}. (${timestamp})`);
        return;

    } catch (e) {
        // Log error
        console.log(e);
    };
};