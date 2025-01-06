export default async (client, info) => {
    // return; // Comment out to enable debugging, uncomment to disable
    let infoLimited = info.substring(0, 2000);
    let devChannel = await client.channels.fetch("1325890140517826580"); // Replace ID with specific debug channel ID
    return devChannel.send({ content: infoLimited });
};