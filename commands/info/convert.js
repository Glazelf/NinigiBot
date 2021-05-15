exports.run = (client, message) => {
    try {
        let split = message.content.split(` `, 3);
        let conversionType = split[1];
        let conversionValue = split[2];

        if (!conversionValue) return message.reply(`You need to provide a number to calculate.`);
        if (isNaN(conversionValue)) return message.reply(`What you provided isn't a number.`);
        parseFloat(conversionValue);

        conversionType = conversionType.toLowerCase();

        switch (conversionType) {
            case "fahrenheit":
                conversionReturn = (conversionValue - 32) * 5 / 9;
                typeCapitalized = "degrees Fahrenheit";
                typeReturn = "degrees Celsius"
                break;
            case "feet":
                conversionReturn = conversionValue / 3.28084;
                typeCapitalized = "feet";
                typeReturn = "meters";
                break;
            case "lbs":
                conversionReturn = conversionValue * 0.453592;
                typeCapitalized = "lbs";
                typeReturn = "kilos";
                break;
            default:
                return message.reply(`You didn't return a supported conversion type, the currently supported types are Fahrenheit, feet and lbs.`);
        };
        conversionReturn = Math.round(conversionReturn * 100) / 100;

        return message.reply(`${conversionValue} ${typeCapitalized} equals ${conversionReturn} ${typeReturn}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "convert",
    aliases: ["conv"],
    description: "Converts from dumb American units to epic global units.",
    options: [{
        name: "fahrenheit",
        description: "Convert from Fahrenheit to Celsius.",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of Fahrenheits.",
            type: "INTEGER"
        }
        ]
    }, {
        name: "feet",
        description: "Convert from feet to meters.",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of feet.",
            type: "INTEGER"
        }]
    }, {
        name: "lbs",
        description: "Convert from lbs to kilos",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of lbs.",
            type: "INTEGER"
        }]
    }]
};