export default async (client, info) => {
    // return; // Comment out to enable debugging, uncomment to disable
    let infoLimited = info.substring(0, 2000);
    let debugChannelID = "1325890140517826580"; // Replace ID with specific debug channel ID
    let debugChannel = client.channels.cache.get(debugChannelID);
    if (!debugChannel) debugChannel = await client.channels.fetch("1325890140517826580");
    return debugChannel.send({ content: infoLimited });
};