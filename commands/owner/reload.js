import {
    InteractionContextType,
    SlashCommandBuilder,
    Collection
} from "discord.js";
import fs from 'fs';
import path from 'path';
import sendMessage from "../../util/sendMessage.js";
import isOwner from "../../util/perms/isOwner.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import config from "../../config.json" with { type: "json" };

export default async (interaction, ephemeral) => {
    ephemeral = false;
    let ownerBool = await isOwner(interaction.client, interaction.user);
    if (!ownerBool) return sendMessage({ interaction: interaction, content: globalVars.lackPermsString });

    interaction.client.commands = new Collection();
    console.log(interaction.client.commands)

    // This loop reads the /events/ folder and attaches each event file to the appropriate event.
    await fs.promises.readdir("./events/").then(async (files) => {
        for await (const file of files) {
            // If the file is not a JS file, ignore it.
            if (!file.endsWith(".js")) return;
            // Load the event file itself
            let event = await import(`../../events/${file}`);
            event = event.default;
            // Get just the event name from the file name
            let eventName = file.split(".")[0];
            // Each event will be called with the client argument,
            // followed by its "normal" arguments, like message, member, etc.
            interaction.client.on(eventName, event.bind(null, interaction.client));
        };
    }).catch((err) => {
        console.log(err);
    });
    await walk(`./commands/`);
    console.log("beans")
    return sendMessage({ interaction: interaction, content: `Reloaded events and commands!` });

    // This loop reads the /commands/ folder and attaches each command file to the appropriate command.
    async function walk(dir, callback) {
        await fs.promises.readdir(dir).then(async (files) => {
            for (const file of files) {
                let filepath = path.join(dir, file);
                await fs.promises.stat(filepath).then(async (stats) => {
                    if (stats.isDirectory()) {
                        await walk(filepath, interaction.client, callback);
                    } else if (stats.isFile() && file.endsWith('.js')) {
                        let props = await import(`../../${filepath}`);
                        if (!props.commandObject.type) props.commandObject.type = ApplicationCommandType.ChatInput;
                        // Set default contexts (all). This is already the API default (null acts the same) but this lets me keep the later checks simpler
                        if (!props.commandObject.contexts) props.commandObject.contexts = [
                            InteractionContextType.Guild,
                            InteractionContextType.BotDM,
                            InteractionContextType.PrivateChannel
                        ];
                        // If command requires a guild; limit to guild installs
                        if (!props.commandObject.integration_types &&
                            props.commandObject.contexts.includes(InteractionContextType.Guild) &&
                            props.commandObject.contexts.length == 1) props.commandObject.integration_types = [ApplicationIntegrationType.GuildInstall];
                        // All install types by default
                        if (!props.commandObject.integration_types) props.commandObject.integration_types = [
                            ApplicationIntegrationType.GuildInstall,
                            ApplicationIntegrationType.UserInstall
                        ];
                        let commandName = file.split(".")[0].toLowerCase();
                        // console.log(`Loaded command: ${commandName} ✔`);
                        interaction.client.commands.set(commandName, props);
                    };
                });
            };
        }).catch((err) => {
            console.log(err);
        });
    };
};

export const guildID = config.devServerID;

// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload commands and events.")
    .setContexts([InteractionContextType.Guild]);