module.exports.run = async (client, message, args) => {
    try {
      // Import globals
        let globalVars = require('../events/ready');
        const member = message.member;
        const role = member.guild.roles.cache.find(role => role.name === globalVars.stanRole);
        if (!role) return message.channel.send(`> There is no stan role. Contact the owner of this bot to specify a valid one, ${message.author}.`);
        if(member.roles.cache.has(role.id)){
            await member.roles.remove(role);
            message.reply('Now you will not be stanned *booo*')
        } else {
            await member.roles.add(role);
            message.reply('Now you will be stanned! Yay!')
        }

    } catch (e) {
      // log error
      console.log(e);
  
      // return confirmation
      return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
  };
  