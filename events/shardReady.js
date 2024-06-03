const Discord = require("discord.js");
module.exports = async (client, id) => {
    try {
        const globalVars = require('../objects/globalVars.json');
        const getTime = require('../util/getTime');
        let timestamp = await getTime(client);

        let presence = initPresence();
        // Set global variables
        client.globalVars = globalVars;
        client.globalVars.presence = presence;
        // Set bot status
        await client.user.setPresence(presence);
        console.log(`Presence set to "${client.user.presence.activities[0].type} ${client.user.presence.activities[0].name}"`);
        // Start affairs
        const stan = require('../affairs/stan');
        const birthday = require('../affairs/birthday');
        stan(client);
        birthday(client);
        // const { bank } = require('../database/bank');
        // const { Users } = require('../database/dbServices/server.api');
        // const storedBalances = await Users.findAll();
        // storedBalances.forEach(b => bank.currency.set(b.user_id, b));

        // Console log status
        return console.log(`Launched shard ${id}. (${timestamp})`);

    } catch (e) {
        // Log error
        console.log(e);
    };
};

function initPresence() {
    let presence = { activities: [{ name: 'the lake theme', type: Discord.ActivityType.Listening }], status: 'idle' };
    return presence;
};