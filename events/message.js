module.exports = (client, message) => {
  try {
    const Discord = require("discord.js");
    let NinigiDMChannelID = "674371091006881832";

    // Import totals
    let globalVars = require('./ready');

    // Ignore all bots
    if (message.author.bot) return;

    // +1 messages count
    globalVars.totalMessages += 1;

    // Ignore commands in DMs
    if (message.channel.type == "dm") {
      if (message.content.indexOf(client.config.prefix) == 0) {
        message.author.send(`> Sorry <@${message.author.id}>, you're not allowed to use commands in private messages!`).catch(console.error);
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
      let DMChannel = client.channels.find('id', NinigiDMChannelID);

      const dmEmbed = new Discord.RichEmbed()
        .setColor("#219DCD")
        .setAuthor(`DM`, message.author.avatarURL)
        .setThumbnail(message.author.avatarURL)
        .addField(`Author account:`, message.author, false)
        .addField(`Author ID:`, message.author.id, false)
        .addField(`Message content:`, message.content, false)
        // .addField(`Attachment(s):`, AttachmentString, false)
        .setFooter(`DM passed through by ${client.config.botName}.`)
        .setTimestamp();

      return DMChannel.send(dmEmbed);
    };

    if (message.guild.id == client.config.botServerID) {
      // Correct Sysbot prefix
      let lowercaseContent = message.content.toLowerCase();
      let pinsEmote = "<a:checkthepins:712296040455471185>";

      if (lowercaseContent.startsWith("?trade") || lowercaseContent.startsWith(".trade") || lowercaseContent.startsWith("$trade") || lowercaseContent.startsWith("&trade")) {
        return message.channel.send(`> The prefix for <@${client.config.sysbotID}> is "!" and trade commands can only be used in <#${client.config.botChannelID}>.
> For more information ${pinsEmote} in <#${client.config.botChannelID}>, <@${message.author.id}>.`);
      };

      if (message.channel.id !== client.config.botChannelID && message.guild.id == client.config.botServerID && lowercaseContent.startsWith("!trade")) {
        return message.channel.send(`> Trade commands for <@${client.config.sysbotID}> can only be used in <#${client.config.botChannelID}>.
> For more information ${pinsEmote} in <#${client.config.botChannelID}>, <@${message.author.id}>.`);
      };
    };

    // Ignore messages not starting with the prefix
    if (message.content.indexOf(client.config.prefix) !== 0) return;

    // Ignore messages that are just prefix
    if (message.content === client.config.prefix) return;

    // Ignore messages that start with prefix double or prefix space
    let secondCharacter = message.content.charAt(1);
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