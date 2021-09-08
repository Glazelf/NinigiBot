exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const getTime = require('../../util/getTime');

        if (message.member.id !== client.config.ownerID) return sendMessage(client, message, globalVars.lackPerms);

        let timestamp = await getTime();

        let user;
        if (message.type == 'DEFAULT') {
            user = message.author;
        } else {
            user = message.member.user;
        };

        // Return message then destroy
        await sendMessage(client, message, `Restarting for **${user.tag}**.`);
        console.log(`Restarting for ${user.tag}. (${timestamp})`);

        // Skip deleting all global commands because of rate limits per day
        // await client.application.commands.set([]);

        // Destroy, will reboot thanks to forever package
        await client.destroy();
        return process.exit();

        // Restarts a shard
        // await sendMessage(client, message, `Restarting...`);
        // await client.destroy();
        // await client.login(client.config.token);
        // return sendMessage(client, message, `Successfully restarted!`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "restart",
    aliases: [],
    description: "Restart bot and reload all files."
};