module.exports = (string, length, regex_check=true) => {
    let tstring = string.trim();
    if (tstring.length < 1) {
        return 'TooShort'
    } else if ( tstring.length > length) {
        return 'TooLong'
    } else if (regex_check && !tstring.match(/^[a-zA-Z0-9][a-zA-Z0-9\s.]+$/i)){
        return 'InvalidChars'
    }
    return 'Ok'
};
