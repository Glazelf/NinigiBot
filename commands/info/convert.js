exports.run = async (client, message, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
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
            case "gallons":
                conversionReturn = conversionValue * 3.78541;
                typeCapitalized = "gallons";
                typeReturn = "liters";
                break;
            case "horsepower":
                conversionReturn = conversionValue * 745.7;
                typeCapitalized = "horsepower";
                typeReturn = "watts";
                break;
            case "inches":
                conversionReturn = conversionValue * 2.54;
                typeCapitalized = "inches";
                typeReturn = "centimeters";
                break;
            case "lbs":
                conversionReturn = conversionValue * 0.453592;
                typeCapitalized = "lbs";
                typeReturn = "kilos";
                break;
            default:
                return sendMessage(client, message, `You didn't return a supported conversion type, the currently supported types are Fahrenheit, feet, gallons, horsepower, inches, and lbs.`);
        };
        conversionReturn = Math.round(conversionReturn * 100) / 100;

        return sendMessage(client, message, `${conversionValue} ${typeCapitalized} equals ${conversionReturn} ${typeReturn}.`);

    } catch (e) {
        // Log error
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
        name: "gallons",
        description: "Convert from gallons to liters.",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of gallons.",
            type: "INTEGER"
        }]
    }, {
        name: "horsepower",
        description: "Convert from horsepower to watts.",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of horsepower.",
            type: "INTEGER"
        }]
    }, {
        name: "inches",
        description: "Convert from inches to centimeters.",
        type: "SUB_COMMAND",
        options: [{
            name: "amount",
            description: "The amount of inches.",
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
