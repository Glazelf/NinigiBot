export default (number, locale) => {
    const formatter = new Intl.NumberFormat(locale);
    if (Math.abs(number) < 10000) return number;
    return formatter.format(number);
};