exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');

        if (interaction.user.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let removeInteractions = args.find(element => element.name == "remove-interactions").value;
        let timestamp = await getTime(client);

        // Return messages then destroy
        let restartString = "Restarting.";
        if (removeInteractions) restartString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
        await sendMessage({ client: client, interaction: interaction, content: restartString });
        console.log(`Restarting for ${interaction.user.tag}. (${timestamp})`);

        if (removeInteractions) {

            // Delete all global commands
            await client.application.commands.set([]);

            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                let adminBool = await isAdmin(client, guild.me);
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
        // return sendMessage({client: client, interaction: interaction, content: `Successfully restarted!`);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "restart",
    description: "Restart bot and reload all files.",
    serverID: ["759344085420605471"],
    options: [{
        name: "reset-interactions",
        type: "BOOLEAN",
        description: "Reset all interactions?",
        required: true
    }]
};