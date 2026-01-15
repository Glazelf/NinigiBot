export default (input) => {
    input = input * 3.28084;
    let inputSplit = input.toString().split(".");
    inputSplit[1] = Math.round(inputSplit[1] * 1.2);
    let twoDecimals = inputSplit[1].toString().startsWith("1");
    let roundingMultiplier = 10;
    if (twoDecimals) roundingMultiplier = 100;
    let output = (Math.round(inputSplit.join(".") * roundingMultiplier) / roundingMultiplier).toString().replace(".", "'") + "\"";
    return output;
};