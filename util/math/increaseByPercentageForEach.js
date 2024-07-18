export default (input, amount, percentage) => {
    let multiplierInteger = 1;
    let multiplierDecimal = 0;
    while (amount >= 1) {
        multiplierDecimal += percentage;
        amount--;
    };
    while (multiplierDecimal >= 100) {
        multiplierDecimal -= 100;
        multiplierInteger++;
    };
    let mulitplier = parseFloat(`${multiplierInteger}.${multiplierDecimal}`);
    return Math.floor(input * mulitplier);
};