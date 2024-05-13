const { ShardingManager } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const forever = require('forever');

// Configuration
const config = require('./config.json');
const runWithSharding = true; // set to true to run with sharding, false otherwise
const runWithForever = true; // set to true to run with forever, false otherwise

// Bot initialization function
async function startBot() {
    const intents = [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildBans, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.MessageContent];
    const partials = [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.User];

    const client = new Discord.Client({
        intents: intents,
        partials: partials,
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    });

    client.config = config;

    // Load events
    fs.readdir("./events/", (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            const event = require(`./events/${file}`);
            let eventName = file.split(".")[0];
            client.on(eventName, event.bind(null, client));
            delete require.cache[require.resolve(`./events/${file}`)];
        });
    });

    client.commands = new Discord.Collection();
    client.aliases = new Discord.Collection();

    await walk(`./commands/`);
    console.log("Loaded commands!");

    client.login(config.token);
}

// Load commands
async function walk(dir) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            let filepath = path.join(dir, file);
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    walk(filepath);
                } else if (stats.isFile() && file.endsWith('.js')) {
                    let props = require(`./${filepath}`);
                    if (!props.config.type) props.config.type = Discord.ApplicationCommandType.ChatInput;
                    let commandName = file.split(".")[0];
                    client.commands.set(commandName, props);
                    if (props.config.aliases) {
                        props.config.aliases.forEach(alias => {
                            if (client.aliases.get(alias)) return console.log(`Warning: Two commands share an alias name: ${alias}`);
                            client.aliases.set(alias, commandName);
                        });
                    };
                };
            });
        });
    });
}

// Start bot based on configuration
if (runWithSharding) {
    const manager = new ShardingManager('./bot.js', { token: config.token });
    manager.on('shardCreate', shard => console.log(`Launching shard ${shard.id}`));
    manager.spawn(2); // Change 2 to 1 to run on a singular shard
} else {
    startBot();
}

if (runWithForever) {
    let foreverOptions = [{ "uid": "Ninigi" }];
    let child = forever.start('./bot.js', foreverOptions);
    forever.startServer(child);
}
