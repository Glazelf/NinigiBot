const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default (birthday) => {
    if (!birthday) return;
    return `${parseMonth(birthday[2] + birthday[3])} ${birthday[0] + birthday[1]}`;
};

const parseMonth = (month) => {
    return months[parseInt(month) - 1];
};