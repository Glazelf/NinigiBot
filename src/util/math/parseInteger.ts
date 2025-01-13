export default (number: any) => {
    if (number > 0) return `+${number}`;
    if (number < 0) return number;
};