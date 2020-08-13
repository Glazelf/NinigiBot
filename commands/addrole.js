const {EligibleRoles} = require('../storeObjects')

module.exports.run = async (client, message) => {
    try {
      // Import globals
        let globalVars = require('../events/ready');
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(globalVars.lackPerms);
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/)
        if (arguments.length<1) return message.channel.send(`> Please provide a role, use \`!role  help\` to see the available roles, ${message.author}.`);
        const role = message.member.guild.roles.cache.find(role => role.name.toLowerCase() === arguments.toLowerCase());
        if(!role) return message.reply('That role does not exist.');
        const roleName = await EligibleRoles.findOne({where:{name:role.name}})
        if (roleName) {
            await roleName.destroy();
            return message.reply(`The role ${role.name} is no longer eligible.`)
        } else {
            await EligibleRoles.upsert({name: role.name})
            return message.reply(`The role ${role.name} now is eligible.`)
        }

    } catch (e) {
      // log error
      console.log(e);
  
      // return confirmation
      return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
  };