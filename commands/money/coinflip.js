exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const { bank } = require('../../database/bank');
        const input = message.content.split(` `, 2);
        let amount = input[1];
        if (amount.toLowerCase() == "all") amount = bank.currency.getBalance(message.author.id);
        if (amount.toLowerCase() == "half") amount = bank.currency.getBalance(message.author.id)/2;

        if (!amount || isNaN(amount)) return message.channel.send(`> You need to specify a valid number to gamble, ${message.author}.`);
        amount = Math.floor(amount);
        if (amount <= 0) return message.channel.send(`> Please enter an amount that's equal to or larger than 1, ${message.author}.`);

        if (amount > bank.currency.getBalance(message.author.id)) {
            return message.channel.send(`> You don't have enough currency, ${message.author}.
> You only have ${Math.floor(bank.currency.getBalance(message.author.id))}💰.`);
        };

        let returnString = `> Congratulations, ${message.author}, you flipped **heads** and won ${amount}💰.`;

        // Coinflip randomization
        let r = Math.floor((Math.random() * 10) + 1);
        if (r % 2 !== 0) {
            returnString = `> Sorry, ${message.author}, you flipped **tails** and lost ${amount}💰.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.author.id, amount);
        return message.channel.send(returnString);

    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${globalVars.prefix}info.`);
    };
};
