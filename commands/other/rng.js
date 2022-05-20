exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');

        let lowNumber = args.find(element => element.name == "number-min").value;
        let highNumber = args.find(element => element.name == "number-max").value;

        if (lowNumber.startsWith("-")) lowNumber = lowNumber.substring(1, lowNumber.length + 1) * -1;
        if (highNumber.startsWith("-")) highNumber = highNumber.substring(1, highNumber.length + 1) * -1;
        if (lowNumber > highNumber) return sendMessage({ client: client, interaction: interaction, content: `Make sure the first number is lower than the second number.` });

        let randomValue = randomNumber(lowNumber, highNumber);

        return sendMessage({ client: client, interaction: interaction, content: `Your random number is \`${randomValue}\`.` });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "rng",
    description: "Generate a random number.",
    options: [{
        name: "number-min",
        type: "INTEGER",
        description: "Minimal number.",
        required: true
    }, {
        name: "number-max",
        type: "INTEGER",
        description: "Maximum number.",
        required: true
    }]
};