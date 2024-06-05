import Discord from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import forever from "forever";
import isOwner from "../../util/isOwner.js";
import getTime from "../../util/getTime.js";

export default async (client, interaction) => {
    try {
        let ownerBool = await isOwner(client, interaction.user);
        if (!ownerBool) return sendMessage({ client: client, interaction: interaction, content: globalVars.lackPerms });

        let removeInteractions = false;
        let interactionsArg = interaction.options.getBoolean("remove-interactions");
        if (interactionsArg === true) removeInteractions = interactionsArg;

        let timestamp = await getTime(client);
        let shutdownString = "Shutting down.";
        if (removeInteractions) shutdownString += "\nRemoving all slash commands, context menus etc. This might take a bit.";
        await sendMessage({ client: client, interaction: interaction, content: shutdownString });

        if (removeInteractions) {
            await interaction.deferReply({ ephemeral: true });
            // Delete all global commands
            await client.application.commands.set([]);
            // Delete all guild commands
            await client.guilds.cache.forEach(async (guild) => {
                guild.commands.set([]).catch(e => {
                    return;
                });
            });
        };
        // Ignore forever if fails, mostly for test-bots not running it.
        if (forever) {
            try {
                forever.stopAll();
            } catch (e) {
                console.log(e);
            };
        };
        console.log(`Bot killed by ${interaction.user.username}. (${timestamp})`);

        await client.destroy();
        return process.exit();

    } catch (e) {
        logger(e, client, interaction);
    };
};

export const config = {
    name: "kill",
    description: "Shuts down bot.",
    serverID: ["759344085420605471"],
    options: [{
        name: "remove-interactions",
        type: Discord.ApplicationCommandOptionType.Boolean,
        description: "Remove all interactions?"
    }]
};