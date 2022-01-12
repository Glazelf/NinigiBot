exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');
        let inputNumbers = args.join(" ").replace(", ", " ").split(" ");

        if (!inputNumbers[1]) return sendMessage({ client: client, message: message, content: `You need to provide 2 numbers.` });
        let lowNumber = inputNumbers[0];
        let highNumber = inputNumbers[1];
        if (lowNumber.startsWith("-")) lowNumber = lowNumber.substring(1, lowNumber.length + 1) * -1;
        if (highNumber.startsWith("-")) highNumber = highNumber.substring(1, highNumber.length + 1) * -1;

        if (isNaN(lowNumber) || isNaN(highNumber)) return sendMessage({ client: client, message: message, content: `Make sure both values provided are numbers.` });
        lowNumber = parseInt(lowNumber);
        highNumber = parseInt(highNumber);
        if (lowNumber > highNumber) return sendMessage({ client: client, message: message, content: `Make sure the first number is lower than the second number.` });

        let randomValue = randomNumber(lowNumber, highNumber);

        return sendMessage({ client: client, message: message, content: `Your random number is \`${randomValue}\`.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "rng",
    description: "Generate a random number.",
    options: [{
        name: "numbers",
        type: "STRING",
        description: "Two numbers seperated by a comma.",
        required: true
    }]
};