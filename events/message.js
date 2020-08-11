module.exports = (client, message) => {
  try {
    const Discord = require("discord.js");
    const { bank } = require('../bank');
    let NinigiDMChannelID = "674371091006881832";
    let secondCharacter = message.content.charAt(1);
    let Konohana = client.users.cache.get(sysbotID);

    // Import globals
    let globalVars = require('./ready');

    // Ignore all bots
    if (message.author.bot) return;

    // Add currency if message doesn't start with prefix
    if (message.content.indexOf(client.config.prefix || "!" || "$") !== 0) bank.currency.add(message.author.id, +0.1);

    // Add message count
    globalVars.totalMessages += 1;

    // Ignore commands in DMs
    if (message.channel.type == "dm") {
      if (message.content.indexOf(client.config.prefix) == 0) {
        message.author.send(`> Sorry ${message.author}, you're not allowed to use commands in private messages!`).catch(console.error);
      };

      let AttachmentString = `None`;
      var Attachment = (message.attachments).array();
      if (message.attachment) {
        let AttachmentString = ``;
        forEach(Attachment)
        AttachmentString = `${AttachmentString}
${Attachment.url}`;
      };

      if (!message.content) {
        message.content = `None`
      };

      // Send message contents to dm channel
      let DMChannel = client.channels.cache.get(NinigiDMChannelID);
      let messageImage = null;
      if (message.attachments.size > 0) messageImage = message.attachments.first().url;

      const dmEmbed = new Discord.MessageEmbed()
        .setColor("#219DCD")
        .setAuthor(`DM Message`, message.author.avatarURL())
        .setThumbnail(message.author.avatarURL())
        .addField(`Author Account:`, message.author, false)
        .addField(`Author ID:`, message.author.id, false)
        .addField(`Message content:`, message.content, false)
        .setImage(messageImage)
        .setFooter(`DM passed through by ${client.config.botName}.`)
        .setTimestamp();

      return DMChannel.send(dmEmbed);
    };

    // Starboard functionality
    message.awaitReactions(reaction => reaction.emoji.name == "⭐", { max: globalVars.starboardLimit, time: 86400000 }).then(collected => {
      const starboard = message.guild.channels.cache.find(channel => channel.name === "starboard");
      if (starboard) {
        if (collected.first().count == globalVars.starboardLimit) {
          if (message.channel !== starboard) {
            let messageImage = null;
            if (message.attachments.size > 0) messageImage = message.attachments.first().url;

            if (!starboard.permissionsFor(message.guild.me).has("EMBED_LINKS")) return message.channel.send(`> I don't have permissions to send embedded message to your starboard.`);

            const starEmbed = new Discord.MessageEmbed()
              .setColor("#219DCD")
              .setAuthor(`⭐ ${message.author.username}`, message.author.avatarURL())
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

    if (message.guild.id == client.config.botServerID) {
      // Correct Sysbot prefix
      let lowercaseContent = message.content.toLowerCase();
      let pinsEmote = "<a:checkthepins:712296040455471185>";

      if (lowercaseContent.startsWith("?trade") || lowercaseContent.startsWith(".trade") || lowercaseContent.startsWith("$trade") || lowercaseContent.startsWith("&trade")) {
        return message.channel.send(`> The prefix for <@${sysbotID}> is "!" and trade commands can only be used in <#${client.config.botChannelID}>.
> For more information ${pinsEmote} in <#${client.config.botChannelID}>, ${message.author}.`);
      };

      if (message.channel.id !== client.config.botChannelID && message.guild.id == client.config.botServerID && lowercaseContent.startsWith("!trade")) {
        return message.channel.send(`> Trade commands for <@${sysbotID}> can only be used in <#${client.config.botChannelID}>.
> For more information ${pinsEmote} in <#${client.config.botChannelID}>, ${message.author}.`);
      };
    };

    // Ignore messages not starting with the prefix
    if (message.content.indexOf(client.config.prefix) !== 0) return;

    // Ignore messages that are just prefix
    if (message.content === client.config.prefix) return;

    // Ignore messages that start with prefix double or prefix space
    if (secondCharacter == client.config.prefix || secondCharacter == ` `) return;

    // Standard definition
    const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);

    // If that command doesn't exist, exit
    if (!cmd) return;

    // +1 command count and drop message count
    globalVars.totalCommands += 1;
    globalVars.totalMessages -= 1;

    // Run the command
    cmd.run(client, message, args);

  } catch (e) {
    // log error
    console.log(e);
  };
};