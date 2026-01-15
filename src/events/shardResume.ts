import globalVars from "../objects/globalVars.json" with { type: "json" };

export default async (client: any, id) => {
    try {
        // Set bot status
        client.user.setPresence(globalVars.presence);
        // console.log(`Reconnected shard ${id}. (${timestamp})`);
        return;

    } catch (e: any) {
        console.log(e);
    };
};