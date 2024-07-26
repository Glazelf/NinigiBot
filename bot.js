import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ApplicationCommandType,
    ActivityType
} from "discord.js";
import fs from 'fs';
import path from 'path';
import globalVars from "./objects/globalVars.json" with { type: "json" };
import config from './config.json' with { type: "json" };

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    // GatewayIntentBits.GuildVoiceStates,
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
    }], status: "idle"
};
globalVars.presence = presenceObject;

const client = new Client({
    presence: presenceObject,
    intents: intents,
    partials: partials,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    },
    shards: "auto"
});
// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(async (file) => {
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
    });
});
client.commands = new Collection();
await walk(`./commands/`);
console.log("Loaded commands!");

client.login(config.token);
// This loop reads the /commands/ folder and attaches each command file to the appropriate command.
async function walk(dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            let filepath = path.join(dir, file);
            fs.stat(filepath, async function (err, stats) {
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile() && file.endsWith('.js')) {
                    let props = await import(`./${filepath}`);
                    if (!props.commandObject.type) props.commandObject.type = ApplicationCommandType.ChatInput;
                    let commandName = file.split(".")[0].toLowerCase();
                    // console.log(`Loaded command: ${commandName} ✔`);
                    client.commands.set(commandName, props);
                };
            });
        });
    });
};