const {bank} = require('../bank');

exports.run = async (client, message, ) => {
    const target = message.mentions.users.first() || message.author;
	return message.channel.send(`${target.tag} has ${bank.currency.getBalance(target.id)}💰`);
};
