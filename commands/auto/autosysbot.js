module.exports.run = async (client, message) => {
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.slice(1).trim();
        const [, , arguments] = input.match(/(\w+)\s*([\s\S]*)/);
      
      
      if ('how do i use sysbot?') return message.channel.send(
