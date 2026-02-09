export default (number: number): string | number | undefined => {
    if (number > 0) return `+${number}`;
    if (number < 0) return number;
};