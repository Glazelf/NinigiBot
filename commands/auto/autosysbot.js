module.exports.run = async (client, message, args) => { 
let globalVars = require('../../events/ready');
      try { 
            if (message.guild.id !== client.config.botServerID) return; 
            const Discord = require("discord.js"); 
            const { Prefixes } = require('../../database/dbObjects'); 
            let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } }); 
            if (prefix) { prefix = prefix.prefix; } else { prefix = globalVars.prefix; };
      






if ('how do i use sysbot?') 
      return message.channel.send(`Get either ${PKMBotRole} or ${ACNHBotRole} (or both) from ${botChannel} using \`?role help\`. These roles will unlock the bot specific channel (${PKMBotchannel} for PKM ${ACNHBotChannel} for ACNH).
Go there and read the pins there for more instructions.
Please don't ask dumb questions like "When will x bot will be online???". The bot hosts in this server are doing so in their free time without expecting anything in return (though donations are appreciated), bots are on when available. 
${PKMBotRole} and/or ${ACNHBotRole} role will be pinged when bots go online. You can check bot status at any time using \`?sysbot\`.
If you want more uptime/consistency refer to the paypal links in the pins of ${botChannel} to donate money to me and fund me more hardware to run more bots on at the same time.`)
