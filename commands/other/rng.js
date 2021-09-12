exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        let inputNumbers = args.join(" ").replace(", ", " ").split(" ");

        if (!inputNumbers[1]) return sendMessage(client, message, `You need to provide 2 numbers.`);
        let lowNumber = inputNumbers[0];
        let highNumber = inputNumbers[1];
        if (lowNumber.startsWith("-")) lowNumber = lowNumber.substring(1, lowNumber.length + 1) * -1;
        if (highNumber.startsWith("-")) highNumber = highNumber.substring(1, highNumber.length + 1) * -1;

        if (isNaN(lowNumber) || isNaN(highNumber)) return sendMessage(client, message, `Make sure both values provided are numbers.`);
        lowNumber = parseInt(lowNumber);
        highNumber = parseInt(highNumber);
        if (lowNumber > highNumber) return sendMessage(client, message, `Make sure the first number is lower than the second number.`);

        let randomValue = randomIntFromInterval(lowNumber, highNumber);

        return sendMessage(client, message, `Your random number is \`${randomValue}\`.`);

        function randomIntFromInterval(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "rng",
    aliases: ["random", "number"],
    description: "Generate a random number.",
    options: [{
        name: "numbers",
        type: "STRING",
        description: "Two numbers seperated by a comma.",
        required: true
    }]
};