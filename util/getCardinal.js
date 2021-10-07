module.exports = (number) => {
    if (number % 10 === 1 && number !== 11) return number + 'st';
    if (number % 10 === 2 && number !== 12) return number + 'nd';
    if (number % 10 === 3 && number !== 13) return number + 'rd';
    return number + 'th';
};