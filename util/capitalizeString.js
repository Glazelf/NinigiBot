module.exports = (str) => {
    let exceptions = ["double-edge", "self-destruct", "soft-boiled", "mud-slap", "lock-on", "will-o-wisp", "x-scissor", "freeze-dry", "topsy-turvy", "soul-heart", "multi-attack"];
    let exceptionsLowercase = ["v-create", "u-turn"];

    str = str.replace("-s-", "'s-")
    let splitStr = str;
    if (!exceptionsLowercase.includes(str)) splitStr = str.split('-');
    if (typeof splitStr != 'object') splitStr = str.split(" "); // experimental catch for monster hunter usage?

    if (str.toLowerCase() == "rks-system") {
        splitStr = "RKS System";
    } else {
        for (let i = 0; i < splitStr.length; i++) {
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        };
    };
    // Return the joined string
    let returnStr = splitStr;

    if (splitStr.length == 1 && typeof splitStr == 'object') returnStr = splitStr[0];
    returnStr = splitStr.join(' ');
    let dashException = returnStr.replaceAll(" ", "-");
    if (exceptions.includes(dashException.toLowerCase())) returnStr = dashException;

    returnStr = returnStr.charAt(0).toUpperCase() + returnStr.slice(1);
    // Pokémon
    if (returnStr == "Baby Doll Eyes") returnStr = "Baby-Doll Eyes";
    if (returnStr == "Power Up Punch") returnStr = "Power-Up Punch";
    if (returnStr == "Trick Or Treat") returnStr = "Trick-or-Treat";
    if (returnStr == "Wake Up Slap") returnStr = "Wake-Up Slap";
    if (returnStr == "Type Null") returnStr = "Type: Null";
    // Monster Hunter
    if (returnStr == "Yian Kut Ku") returnStr = "Yian Kut-Ku";
    return returnStr;
};