export default (string) => {
    if (!string || typeof string !== "string") return "";
    let output = string.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""); // .normalize() and the .replace() are to remove accents etc.
    return output;
};