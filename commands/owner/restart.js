import {
    MessageFlags,
    InteractionContextType,
    PermissionFlagsBits,
    codeBlock,
    SlashCommandBuilder,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import isOwner from "../../util/discord/perms/isOwner.js";
import getTime from "../../util/getTime.js";
import runCommand from "../../util/runCommand.js";
import formatName from "../../util/discord/formatName.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

export default async (interaction, messageFlags) => {
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString, flags: messageFlags.add(MessageFlags.Ephemeral) });

    messageFlags.remove(MessageFlags.Ephemeral);
    await interaction.deferReply({ flags: messageFlags });

    let removeInteractions = false;
    let interactionsArg = interaction.options.getBoolean("reset-interactions");
    if (interactionsArg === true) removeInteractions = interactionsArg;
    let npmInstall = false;
    let installArg = interaction.options.getBoolean("npm-install");
    if (installArg === true) npmInstall = installArg;
    let dbinit = false;
    let dbinitArg = interaction.options.getBoolean("dbinit");
    if (dbinitArg === true) dbinit = dbinitArg;
    let timestamp = getTime();
    console.log(`Restarting for ${formatName(interaction.user.username, false)}. (${timestamp})`);
    let installResult = "";
    // Run commands
    if (npmInstall) {
        installResult = await runCommand("npm install");
        await runCommand("git stash");
    };
    if (dbinit) await runCommand("node dbInit.js");
    // Return messages then destroy
    let restartString = "Restarting.";
    let installResultString = codeBlock("fix", installResult.stdout);
    if (npmInstall) restartString = `NPM installation result:${installResultString}${restartString}`;
    if (removeInteractions) restartString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
    await sendMessage({ interaction: interaction, content: restartString });
    // Remove all interactions (will be reinstated on next boot)
    if (removeInteractions) {
        // Delete all global commands
        await interaction.client.application.commands.set([]);
        // Delete all guild commands
        await interaction.client.guilds.cache.forEach(async (guild) => {
            guild.commands.set([]).catch(e => {
                return;
            });
        });
    };
    // Destroy, will reboot thanks to forever package
    await interaction.client.destroy();
    return process.exit();
};

export const guildID = process.env.DEV_SERVER_ID;

// Boolean options
const resetInteractionsOptions = new SlashCommandBooleanOption()
    .setName("reset-interactions")
    .setDescription("Reset all interactions?");
const npmInstallOption = new SlashCommandBooleanOption()
    .setName("npm-install")
    .setDescription("Run NPM install command?");
const dbInitOption = new SlashCommandBooleanOption()
    .setName("dbinit")
    .setDescription("Initialize database?");
// Full command
export const commandObject = new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart bot and reload all files.")
    .setContexts([InteractionContextType.Guild])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(resetInteractionsOptions)
    .addBooleanOption(npmInstallOption)
    .addBooleanOption(dbInitOption);