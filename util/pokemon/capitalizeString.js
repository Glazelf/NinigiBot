module.exports = async (str) => {
    var splitStr = str.split('-');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    };
    // Return the joined string
    returnStr = splitStr.join(' ');
    if (returnStr == "Type Null") returnStr = "Type: Null";
    return returnStr;
};