export default (str: any, characters: any) => {
    for (let i = str.toString().length; i < characters; i++) {
        str = "0" + str;
    };
    return str;
};