import crypto from "crypto";

export default (min, max) => {
    if (min > max) [min, max] = [max, min]; // Flip variables if min is higher
    min = Math.ceil(min);
    max = Math.floor(max);
    return crypto.randomInt(min, max);
};