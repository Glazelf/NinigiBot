module.exports.run = async (client, bot, message, args) => {
  try {
    if (message.author.id !== client.config.ownerID) {
      return message.channel.send(client.config.lackPerms)
    };

    const Discord = require("discord.js");
    const ms = require("ms");

    function getUserFromMention(mention) {
      if (!mention) return;

      if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
          mention = mention.slice(1);
        };

        return client.users.get(mention);
      };
    };

    //usage: ?tempmute @user 1s/m/h/d
    let tomute = message.member(message.mentions.users.first() || message.members.get(args[0]));
    if (!tomute) return message.reply("Couldn't find user.");
    if (tomute.hasPermission("MANAGE_MESSAGES")) return message.reply(client.config.lackPerms);
    let muterole = message.guild.roles.find(`name`, "Muted");

    //if no role, create
    if (!muterole) {
      try {
        muterole = await message.guild.createRole({
          name: "Muted",
          color: "#000000",
          permissions: []
        })
        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      } catch (e) {
        console.log(e.stack);
      };
    };

    let mutetime = args[1];
    if (!mutetime) return message.reply("You didn't specify a time the target should be muted for.");

    await (tomute.addRole(muterole.id));
    message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}.`);

    setTimeout(function () {
      tomute.removeRole(muterole.id);
      message.channel.send(`<@${tomute.id}> has been unmuted.`);
    }, ms(mutetime));
    
  } catch (e) {
    // send msg to owner
    let members = message.channel.members;
    let owner = members.find('id', client.config.ownerID);
    owner.send(`An error occurred using a command in <#${message.channel.id}> by <@${message.member.user.id}> using a command, check console for more information.`);
    // log error
    console.log(e);
    return message.channel.send(`An error has occurred trying to run the command, please contact <@${client.config.ownerID}>.`)
  };
};

module.exports.help = {
  name: "Mute",
  description: "Replies with the same message you sent.",
  usage: `mute [@target] [time]`
}; 