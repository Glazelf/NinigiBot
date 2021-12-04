module.exports = async (str) => {
    let exceptions = ["double-edge", "self-destruct", "soft-boiled", "mud-slap", "lock-on", "will-o-wisp", "x-scissor", "freeze-dry", "topsy-turvy", "soul-heart", "multi-attack"];
    let exceptionsLowercase = ["v-create", "u-turn"];

    let splitStr = str;
    if (!exceptionsLowercase.includes(str)) splitStr = str.split('-');

    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    };

    // Return the joined string
    let returnStr = splitStr;
    if (typeof splitStr == 'array' || typeof splitStr == 'object') {
        if (splitStr.length == 1) returnStr = splitStr[0];
        returnStr = splitStr.join(' ');

        let dashException = returnStr.replace(" ", "-");
        if (exceptions.includes(dashException.toLowerCase())) returnStr = dashException;
    };
    returnStr = returnStr.charAt(0).toUpperCase() + returnStr.slice(1);
    if (returnStr == "Baby Doll Eyes") returnStr = "Baby-Doll Eyes";
    if (returnStr == "Power Up Punch") returnStr = "Power-Up Punch";
    if (returnStr == "Trick Or Treat") returnStr = "Trick-or-Treat";
    if (returnStr == "Wake Up Slap") returnStr = "Wake-Up Slap";
    if (returnStr == "Type Null") returnStr = "Type: Null";
    return returnStr;
};