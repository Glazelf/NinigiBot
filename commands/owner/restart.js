exports.run = async (client, interaction, logger, globalVars) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        const getTime = require('../../util/getTime');
        const runCommand = require('../../util/runCommand');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });
        await interaction.deferReply({ ephemeral: false });
        let removeInteractions = false;
        let interactionsArg = interaction.options.getBoolean("reset-interactions");
        if (interactionsArg === true) removeInteractions = interactionsArg;
        let npmInstall = false;
        let installArg = interaction.options.getBoolean("npm-install");
        if (installArg === true) npmInstall = installArg;
        let dbinit = false;
        let dbinitArg = interaction.options.getBoolean("dbinit");
        if (dbinitArg === true) dbinit = dbinitArg;
        let timestamp = await getTime(client);
        console.log(`Restarting for ${interaction.user.username}. (${timestamp})`);
        let installResult = "";
        // Run commands
        if (npmInstall) {
            installResult = await runCommand("npm install");
            await runCommand("git stash");
            console.log(installResult)
        };
        if (dbinit) {
            await runCommand("node dbInit.js");
        };
        // Return messages then destroy
        let restartString = "Restarting.";
        if (npmInstall) restartString = `Installed NPM packages. Result:\n\`\`\`${installResult.stdout}\`\`\`\n ${restartString}`;
        if (removeInteractions) restartString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
        await sendMessage({ client: client, interaction: interaction, content: restartString });
        // Remove all interactions (will be reinstated on next boot)
        if (removeInteractions) {
            // Delete all global commands
            await client.application.commands.set([]);
            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                guild.commands.set([]).catch(e => {
                    return;
                });
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
    name: "restart",
    description: "Restart bot and reload all files.",
    serverID: ["759344085420605471"],
    options: [{
        name: "reset-interactions",
        type: "BOOLEAN",
        description: "Reset all interactions?"
    }, {
        name: "npm-install",
        type: "BOOLEAN",
        description: "Run npm install command?"
    }, {
        name: "dbinit",
        type: "BOOLEAN",
        description: "Initialize database?"
    }]
};