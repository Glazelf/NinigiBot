export default (number: any) => {
    return number.toString(16).padStart(6, "0");
};