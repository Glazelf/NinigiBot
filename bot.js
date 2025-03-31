import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ApplicationCommandType,
    ActivityType,
    InteractionContextType,
    ApplicationIntegrationType,
    PresenceUpdateStatus,
    AllowedMentionsTypes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from "discord.js";
import fs from 'fs';
import path from 'path';
import globalVars from "./objects/globalVars.json" with { type: "json" };

import getBotSubscription from './util/discord/getBotSubscription.js';
import sendMessage from './util/discord/sendMessage.js';

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    // Privileged intents
    // GatewayIntentBits.GuildPresences, // Ungranted
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
];
const partials = [
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
    Partials.User
];
// Presence
const customStatus = "💤 Chilling in Valor Cavern";
// When setting multiple activities including a custom status, only the custom status will be displayed which is weird behaviour inconsistent with normal users but it's no big deal for a bot anyways, it's just visual flair.
const presenceObject = {
    activities: [{
        name: customStatus, // Not visible but a required feel, only visible through the API
        state: customStatus, // This is what shows up on users' clients
        type: ActivityType.Custom
    }, {
        name: "the lake theme",
        type: ActivityType.Listening
    }], status: PresenceUpdateStatus.Idle
};
globalVars.presence = presenceObject;

const client = new Client({
    presence: presenceObject,
    intents: intents,
    partials: partials,
    allowedMentions: {
        parse: [AllowedMentionsTypes.User, AllowedMentionsTypes.Role],
        repliedUser: true
    },
    shards: "auto"
});

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
await fs.promises.readdir("./events/").then(async (files) => {
    for await (const file of files) {
        // If the file is not a JS file, ignore it.
        if (!file.endsWith(".js")) return;
        // Load the event file itself
        let event = await import(`./events/${file}`);
        event = event.default;
        // Get just the event name from the file name
        let eventName = file.split(".")[0];
        // Each event will be called with the client argument,
        // followed by its "normal" arguments, like message, member, etc.
        client.on(eventName, event.bind(null, client));
    };
}).catch((err) => {
    console.log(err);
});
console.log("Loaded events!");

client.commands = new Collection();
await walk(`./commands/`);
console.log("Loaded commands!");

client.login(process.env.TOKEN);

// This loop reads the /commands/ folder and attaches each command file to the appropriate command.
async function walk(dir, callback) {
    await fs.promises.readdir(dir).then(async (files) => {
        for (const file of files) {
            let filepath = path.join(dir, file);
            await fs.promises.stat(filepath).then(async (stats) => {
                if (stats.isDirectory()) {
                    await walk(filepath, callback);
                } else if (stats.isFile() && file.endsWith('.js')) {
                    let originalProps = await import(`./${filepath}`);
                    const originalFunction = originalProps.default;
                    let props = {
                        ...originalProps, default: async (interaction, messageFlags) => {
                            let botSubscription = await getBotSubscription(interaction.client.application, interaction.user.id);
                            let isSubscriber = (typeof botSubscription.entitlement !== "undefined"); // Convert to boolean
                            const isNOTShinxAppreciationClub = interaction.guild.id != globalVars.ShinxServerID;
                            const canUseNinigi = isNOTShinxAppreciationClub || interaction.member.id == '301087103008243723' || isSubscriber;
                            if (canUseNinigi) {
                                return originalFunction(interaction, messageFlags);
                            } else {
                                const subscriptionButton = new ButtonBuilder()
                                    .setStyle(ButtonStyle.Premium)
                                    .setSKUId("1164974692889808999");

                                let botButtons2 = new ActionRowBuilder()
                                    .addComponents([subscriptionButton]);
                                sendMessage({
                                    interaction: interaction,
                                    content: `Unlock more features today with a Ninigi Supporter membership! :sparkles:   
                                \nNinigi's full potential at your command with a quick, easy, simple recurring monthly payment of only **US$1.99**!\n\nClick :arrow_down: below :arrow_down: to learn more!`,
                                    components: [botButtons2], flags: messageFlags
                                });
                            }
                        }
                    };

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
                    console.log(props);
                    client.commands.set(commandName, props);
                };
            });
        };
    }).catch((err) => {
        console.log(err);
    });
};