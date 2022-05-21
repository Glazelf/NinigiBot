exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');
        const { bank } = require('../../database/bank');
        let currency = globalVars.currency;
        let balance = await bank.currency.getBalance(message.member.id);

        let ephemeral = true;
        let ephemeralArg = args.find(element => element.name == "ephemeral");
        if (ephemeralArg) ephemeral = ephemeralArg.value;

        // Heads / Tails + Amounts
        let validSides = ["heads", "tails"];
        let winSideArg = args.find(element => element.name == "side");
        let winSide = "heads";
        if (winSideArg && validSides.includes(winSideArg.value)) winSide = winSideArg.value;
        let loseSide = "tails";
        if (winSide == "tails") loseSide = "heads";

        let amount = args.find(element => element.name == "bet-amount").value;

        // Enforce flooring
        amount = Math.floor(amount);
        balance = Math.floor(balance);

        if (amount <= 0) return sendMessage({ client: client, interaction: interaction, content: `Please input a valid number.` });
        if (amount > balance) return sendMessage({ client: client, interaction: interaction, content: `You only have ${Math.floor(balance)}${currency}.` });

        let returnString = `Congratulations, you flipped **${winSide}** and won ${amount}${currency}. You now have ${balance + amount}${currency}.`;

        // Coinflip randomization, code in brackets is executed only upon a loss
        if (Math.random() >= 0.5) {
            returnString = `Sorry, you flipped **${loseSide}** and lost ${amount}${currency}. You now have ${balance - amount}${currency}.`;
            amount = Math.abs(amount) * -1;
        };

        bank.currency.add(message.member.id, amount);
        sendMessage({ client: client, interaction: interaction, content: returnString, ephemeral: ephemeral });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "coinflip",
    description: "Bet money on a coinflip.",
    options: [{
        name: "bet-amount",
        type: "INTEGER",
        description: "The amount of money you want to bet.",
        required: true,
        autocomplete: true
    }, {
        name: "side",
        type: "STRING",
        description: "Whether you want to bet on heads or tails.",
        autocomplete: true
    }, {
        name: "ephemeral",
        type: "BOOLEAN",
        description: "Whether this command is only visible to you.",
    }]
};