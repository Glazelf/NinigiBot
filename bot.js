const Discord = require('discord.js');
let commando = require('discord.js-commando');
const Enmap = require("enmap");
const fs = require("fs");
const path = require("path");

const client = new Discord.Client({ partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'] });
const config = require("./config.json");
client.config = config;

// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {

    // If the file is not a JS file, ignore it.
    if (!file.endsWith(".js")) return;

    // Load the event file itself
    const event = require(`./events/${file}`);

    // Get just the event name from the file name
    let eventName = file.split(".")[0];

    // Each event will be called with the client argument,
    // followed by its "normal" arguments, like message, member, etc.
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

client.commands = new Enmap();

walk(`./commands/`);

client.login(config.token)

// This loop reads the /commands/ folder and attaches each command file to the appropriate command.
function walk(dir, callback) {
  fs.readdir(dir, function (err, files) {
    if (err) throw err;

    files.forEach(function (file) {
      let filepath = path.join(dir, file);
      fs.stat(filepath, function (err, stats) {
        if (stats.isDirectory()) {
          walk(filepath, callback);
        } else if (stats.isFile() && file.endsWith('.js')) {
          let props = require(`./${filepath}`);
          let commandName = file.split(".")[0];
          console.log(`Loading Command: ${commandName} ✔ Success! `);
          client.commands.set(commandName, props);
          // For if I ever want to add command aliases
          // props.conf.aliases.forEach(alias => {
          //   client.aliases.set(alias, commandName);
          // });
        };
      });
    });
  });
};