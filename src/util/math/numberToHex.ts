export default (number) => {
    return number.toString(16).padStart(6, "0");
};