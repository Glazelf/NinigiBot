const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (client, bot, message, args) => {

  //usage: ?tempmute @user 1s/m/h/d
  let tomute = message.member(message.mentions.users.first() || message.members.get(args[0]));
  if(!tomute) return message.reply("Couldn't find user.");
  if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply(client.config.lackPerms);
  let muterole = message.guild.roles.find(`name`, "muted");

  //if no role, create
  if(!muterole){
    try{
      muterole = await message.guild.createRole({
        name: "muted",
        color: "#000000",
        permissions:[]
      })
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }

  let mutetime = args[1];
  if(!mutetime) return message.reply("You didn't specify a time the target should be muted for.");

  await(tomute.addRole(muterole.id));
  message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}.`);

  setTimeout(function(){
    tomute.removeRole(muterole.id);
    message.channel.send(`<@${tomute.id}> has been unmuted.`);
  }, ms(mutetime));
}

module.exports.help = {
    name: "Mute",
    description: "Replies with the same message you sent.",
    usage: `mute [@target] [time]`
}; 