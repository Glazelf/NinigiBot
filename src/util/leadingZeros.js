export default (str, characters) => {
    for (let i = str.toString().length; i < characters; i++) {
        str = "0" + str;
    };
    return str;
};