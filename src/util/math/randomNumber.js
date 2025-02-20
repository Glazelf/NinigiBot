import crypto from "crypto";

export default (min, max) => {
    if (min > max) [min, max] = [max, min]; // Flip variables if min is higher
    if (min === max) return max; // If equal return
    min = Math.ceil(min);
    max = Math.floor(max);
    return crypto.randomInt(min, max);
};