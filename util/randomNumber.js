export default (min, max) => {
    if (min > max) [min, max] = [max, min]; // Flip variables if min is higher
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};