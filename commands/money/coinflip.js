const cooldown = new Set();

exports.run = (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        if (cooldown.has(message.author.id)) {
            return message.channel.send(`> You are currently on cooldown from using this command, ${message.author}.`);
        } else {
            const { bank } = require('../../database/bank');
            let currency = globalVars.currency
            let balance = bank.currency.getBalance(message.author.id);
            const input = message.content.split(` `, 2);
            let inputText = "";
            if (input[1]) inputText = input[1].toLowerCase();
            if (inputText == "half") input[1] = balance / 2;
            if (inputText == "all") input[1] = balance;
            amount = input[1];

            if (!amount || isNaN(amount)) return message.channel.send(`> You need to specify a valid number to gamble, ${message.author}.`);
            amount = Math.floor(amount);
            if (amount <= 0) return message.channel.send(`> Please enter an amount that's equal to or larger than 1, ${message.author}.`);

            if (amount > balance) {
                return message.channel.send(`> You only have ${Math.floor(balance)}${currency}, ${message.author}.`);
            };

            let returnString = `> Congratulations, ${message.author}, you flipped **heads** and won ${amount}${currency}.`;

            // Coinflip randomization
            if (Math.random() >= 0.5) {
                returnString = `> Sorry, ${message.author}, you flipped **tails** and lost ${amount}${currency}.`;
                amount = Math.abs(amount) * -1;
            };

            bank.currency.add(message.author.id, amount);
            message.channel.send(returnString);

            cooldown.add(message.author.id);

            return setTimeout(() => {
                cooldown.delete(message.author.id);
            }, 1500);
        };

    } catch (e) {
        // log error
        console.log(e);

        // log to dev channel
        let baseMessage = `An error occurred in ${message.channel}!
\`\`\`
${e}
\`\`\``;
        if (baseMessage.length > 2000) baseMessage = baseMessage.substring(0, 1950) + `...
\`\`\``;
        let devChannel = client.channels.cache.get(client.config.devChannelID);
        devChannel.send(baseMessage);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command. The error has already been logged, but please also report this as an issue on the Github page or send a message to Glaze#6669. For links and other information use ${globalVars.prefix}info.`);
    };
};
