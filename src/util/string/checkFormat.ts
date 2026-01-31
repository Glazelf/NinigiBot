export default (string: string, length: number, regex_check: boolean = true): string => {
    let tstring = string.trim();
    if (tstring.length < 1) {
        return 'TooShort';
    } else if (tstring.length > length) {
        return 'TooLong';
    } else if (regex_check && !tstring.match(/^[\w\-' ]+$/)) { // Filter to alphanumeric, ', - and spaces. ' is allowed mostly because of trophy names.
        return 'InvalidChars';
    };
    return 'Ok';
};