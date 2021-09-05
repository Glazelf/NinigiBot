exports.run = async (client, message, args = []) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        let conversionType = args[0];
        let conversionValue = args[1];

        if (args.length < 2) return sendMessage(client, message, `You need to provide a conversion type and a number to convert.`);
        if (isNaN(conversionValue)) return sendMessage(client, message, `What you provided isn't a number.`);
        parseFloat(conversionValue);

        conversionType = conversionType.toLowerCase();

        // Get various conversions
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
                return sendMessage(client, message, `You didn't return a supported conversion type, the currently supported types are Fahrenheit, feet and lbs.`);
        };
        conversionReturn = Math.round(conversionReturn * 100) / 100;

        return sendMessage(client, message, `${conversionValue} ${typeCapitalized} equals ${conversionReturn} ${typeReturn}.`);

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