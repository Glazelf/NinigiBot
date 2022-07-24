exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const isOwner = require('../../util/isOwner');
        const getTime = require('../../util/getTime');
        const user_api = require('../../database/dbServices/user.api');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        await interaction.deferReply({ ephemeral: true });

        const users = await user_api.getAllUsers();
        users.forEach(user => {
            
        })
        // Return messages then destroy
        let timestamp = await getTime(client);
        let restartString = "Restarting.";
        if (removeInteractions) restartString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
        await sendMessage({ client: client, interaction: interaction, content: restartString });
        console.log(`Restarting for ${interaction.user.tag}. (${timestamp})`);

        if (removeInteractions) {

            // Delete all global commands
            await client.application.commands.set([]);

            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                let adminBool = isAdmin(client, guild.me);
                try {
                    if (adminBool) guild.commands.set([]);
                } catch (e) {
                    console.log(e);
                };
            });
        };

        // Destroy, will reboot thanks to forever package
        await client.destroy();
        return process.exit();

        // Restarts a shard
        // await sendMessage({client: client, interaction: interaction, content: `Restarting...`);
        // await client.destroy();
        // await client.login(client.config.token);
        // return sendMessage({client: client, interaction: interaction, content: `Restarted!`);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "clean",
    description: "Runs clean up routine of the database files",
    serverID: ["759344085420605471"]
};