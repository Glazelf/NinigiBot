import Discord from "discord.js";
import globalVars from "../objects/globalVars.json" with { type: "json" };
import getTime from "../util/getTime.js";
import stan from "../affairs/stan.js";
import birthday from "../affairs/birthday.js";

export default async (client, id) => {
    try {
        let timestamp = await getTime(client);
        let presence = initPresence();
        globalVars.presence = presence;
        // Set bot status
        await client.user.setPresence(presence);
        console.log(`Presence set to "${client.user.presence.activities[0].type} ${client.user.presence.activities[0].name}"`);
        // Start affairs
        stan(client);
        birthday(client);
        // const storedBalances = await Users.findAll();
        // storedBalances.forEach(b => bank.currency.set(b.user_id, b));
        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e) {
        console.log(e);
    };
};

function initPresence() {
    let presence = { activities: [{ name: 'the lake theme', type: Discord.ActivityType.Listening }], status: 'idle' };
    return presence;
};