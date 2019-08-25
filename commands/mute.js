const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (client, bot, message, args) => {
    function getUserFromMention(mention) {
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/);
    
        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) return;
    
        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];
    
        return client.users.get(id);
    }

  //usage: ?tempmute @user 1s/m/h/d
  const user = getUserFromMention(args[0])
  let tomute = message.member(user || message.members.get(args[0]));
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