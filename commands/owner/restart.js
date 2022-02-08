exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const isAdmin = require('../../util/isAdmin');
        const getTime = require('../../util/getTime');

        if (message.member.id !== client.config.ownerID) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let timestamp = await getTime(client);

        let user = message.member.user;

        // Return message then destroy
        await sendMessage({ client: client, interaction: interaction, content: `Restarting for **${user.tag}**.` });
        console.log(`Restarting for ${user.tag}. (${timestamp})`);

        if (args[0] == 'hard') {
            // Return message then destroy
            await sendMessage({ client: client, interaction: interaction, content: `Starting hard restart for **${user.tag}**.\nRemoving all slash commands, context menus etc. might take a bit.` });

            // Delete all global commands
            await client.application.commands.set([]);

            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                try {
                    let adminBool = await isAdmin(client, guild.me);
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
    defaultPermission: false,
    permission: "owner",
};