const {EligibleRoles} = require('../storeObjects')
module.exports.run = async (client, message, args) => {
    try {
      // Import globals
        let globalVars = require('../events/ready');
        let member = message.member;
        let arguments = args;
        if(message.mentions.members.first()){
          //if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply(globalVars.lackPerms);
          member = message.mentions.members.first();
          arguments.pop()

        }

        const requestRole = arguments.join(' ')
        console.log(requestRole)
        console.log(member.toString())
        if (requestRole.length<1) return message.channel.send(`> Please provide a role, use \`!role  help\` to see the available roles, ${message.author}.`);
        const db = await EligibleRoles.findAll();
        const roles = db.map(role => role.name);
        if(roles.length<1) return message.reply('There are not eligible roles right now.');
        if(requestRole.toLowerCase()==='help'){
            return message.channel.send('> **List of available roles**\n'+roles.join(', '))
        }
        if (!roles.map(a => a.toLowerCase()).includes(requestRole.toLowerCase())) return message.channel.send(`> Invalid role, use \`!role help\` to see the available roles, ${message.author}.`);
        
        const role = member.guild.roles.cache.find(role => role.name.toLowerCase() === requestRole.toLowerCase());
        if(member.roles.cache.has(role.id)){
            await member.roles.remove(role);
            message.channel.send(`${member}, You no longer posess the ${role.name} role. *booo*`)
        } else {
            await member.roles.add(role);
            message.channel.send(`${member}, Now you posess the ${role.name} role! Yay!`)
        }

    } catch (e) {
      // log error
      console.log(e);
  
      // return confirmation
      return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);

    };
  };