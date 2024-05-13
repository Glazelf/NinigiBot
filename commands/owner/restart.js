const Discord = require("discord.js");
exports.run = async (client, interaction, logger) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const isOwner = require('../../util/isOwner');
        const getTime = require('../../util/getTime');
        const runCommand = require('../../util/runCommand');
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: client.globalVars.lackPerms });
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
        };
        if (dbinit) {
            await runCommand("node dbInit.js");
        };
        // Return messages then destroy
        let restartString = "Restarting.";
        let installResultString = Discord.codeBlock(installResult.stdout);
        if (npmInstall) restartString = `NPM installation result:${installResultString}${restartString}`;
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
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Reset all interactions?"
    }, {
        name: "npm-install",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Run npm install command?"
    }, {
        name: "dbinit",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Initialize database?"
    }]
};