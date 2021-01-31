const { ShardingManager } = require('discord.js');
const config = require('./config.json');
const manager = new ShardingManager('./bot.js', { token: config.token });

manager.on('shardCreate', shard => console.log(`Launching shard ${shard.id}`));

// Change 2 to 1 to run on a singular shard
manager.spawn(2);