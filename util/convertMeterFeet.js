module.exports = (input) => {
    input = input * 3.28084;
    let inputSplit = input.toString().split(".");
    inputSplit[1] = inputSplit[1] * 1.2;
    inputSplit[1] = Math.round(inputSplit[1]);
    let twoDecimals = inputSplit[1].toString().startsWith("1");
    let output = inputSplit.join(".");
    let roundingMultiplier = 10;
    if (twoDecimals) roundingMultiplier = 100;
    output = Math.round(output * roundingMultiplier) / roundingMultiplier;
    output = output.toString().replace(".", "'") + "\"";
    return output;
};