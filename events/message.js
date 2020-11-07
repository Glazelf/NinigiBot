const talkedRecently = new Set();

module.exports = async (client, message) => {
  // Import globals
  let globalVars = require('./ready');
  try {
    const Discord = require("discord.js");
    const { bank } = require('../database/bank');
    let secondCharacter = message.content.charAt(1);

    const { DisabledChannels } = require('../database/dbObjects');
    const dbChannels = await DisabledChannels.findAll();
    const channels = dbChannels.map(channel => channel.channel_id);

    const autoMod = require('../util/autoMod');

    // Ignore all bots
    if (message.author.bot) return;

    // Add currency if message doesn't start with prefix
    if (message.content.indexOf(globalVars.prefix) !== 0 && !talkedRecently.has(message.author.id)) {
      bank.currency.add(message.author.id, 1);
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 60000);
    };

    // Add message count
    globalVars.totalMessages += 1;

    // Call image
    let messageImage = null;
    if (message.attachments.size > 0) messageImage = message.attachments.first().url;

    // Ignore commands in DMs
    if (message.channel.type == "dm") {
      if (message.content.indexOf(globalVars.prefix) == 0) {
        message.author.send(`> Sorry ${message.author}, you're not allowed to use commands in private messages!`).catch(console.error);
      };

      // Send message contents to dm channel
      let DMChannel = client.channels.cache.get(client.config.devChannelID);

      let avatar = null;
      if (message.author.avatarURL()) avatar = message.author.avatarURL({ format: "png", dynamic: true });

      const dmEmbed = new Discord.MessageEmbed()
        .setColor(globalVars.embedColor)
        .setAuthor(`DM Message`, avatar)
        .setThumbnail(avatar)
        .addField(`Author Account:`, message.author, false)
        .addField(`Author ID:`, message.author.id, false);
      if (message.content) dmEmbed.addField(`Message content:`, message.content, false);
      dmEmbed
        .setImage(messageImage)
        .setFooter(`DM passed through by ${client.user.tag}.`)
        .setTimestamp();

      return DMChannel.send(dmEmbed);
    };

    // Automod
    autoMod(message);

    // Starboard functionality
    message.awaitReactions(reaction => reaction.emoji.name == "⭐", { max: globalVars.starboardLimit, time: 3600000 }).then(collected => {
      const starboard = message.guild.channels.cache.find(channel => channel.name === "starboard");
      if (starboard) {
        if (!collected.first()) return;
        if (collected.first().count == globalVars.starboardLimit) {
          if (message.channel !== starboard) {

            if (!starboard.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to send embedded message to your starboard.`);

            avatar = null;
            if (message.author.avatarURL()) avatar = message.author.avatarURL({ format: "png", dynamic: true });

            const starEmbed = new Discord.MessageEmbed()
              .setColor(globalVars.embedColor)
              .setAuthor(`⭐ ${message.author.username}`, avatar)
              .setDescription(message.content)
              .addField(`Sent in:`, message.channel, false)
              .addField(`Context:`, `[Link](${message.url})`, false)
              .setImage(messageImage)
              .setTimestamp();
            starboard.send(starEmbed);
          };
        };
      };
    });

    // Ignore messages not starting with the prefix
    if (message.content.indexOf(globalVars.prefix) !== 0) return;

    // Ignore messages that are just prefix
    if (message.content === globalVars.prefix) return;

    // Ignore messages that start with prefix double or prefix space
    if (secondCharacter == globalVars.prefix || secondCharacter == ` `) return;

    // Standard definition
    const args = message.content.slice(globalVars.prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
    let cmd;
    if (client.commands.has(commandName)) {
      cmd = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
      cmd = client.commands.get(client.aliases.get(commandName));
    } else return;

    // Ignore messages sent in a disabled channel
    if (channels.includes(message.channel.id) && !message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(`> Commands have been disabled in this channel, ${message.author}.`);

    // +1 command count and drop message count
    globalVars.totalCommands += 1;
    globalVars.totalMessages -= 1;

    // Run the command
    if (cmd) {
      cmd.run(client, message, args);
    } else return;

  } catch (e) {
    // log error
    const logger = require('../util/logger');

    logger(e, client, message);
  };
};
