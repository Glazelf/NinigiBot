const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
// Configuration
const config = require('./config.json');
const runWithSharding = true; // Set to true to run with sharding, false otherwise
const shardCount = null; // Amount of shards to use, only auto-sharding is supported for now
//// Enforce non-auto sharding in the future
// const manager = new Discord.ShardingManager(startBot(), { token: config.token });
// manager.on('shardCreate', shard => console.log(`Launching shard ${shard.id}`));
// manager.spawn(shardCount);
startBot();

// Bot initialization function
async function startBot() {
    const intents = [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildBans, Discord.GatewayIntentBits.GuildEmojisAndStickers, Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildVoiceStates, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildMessageReactions, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.MessageContent];
    const partials = [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.User];

    let clientObject = {
        intents: intents,
        partials: partials,
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
    };
    if (runWithSharding && !shardCount) clientObject.shards = "auto";
    const client = new Discord.Client(clientObject);

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

    await walk(client, `./commands/`);
    console.log("Loaded commands!");

    client.login(config.token);
};
// Load commands
async function walk(client, dir) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            let filepath = path.join(dir, file);
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    walk(client, filepath);
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