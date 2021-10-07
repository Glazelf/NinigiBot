// Not translated yet, see: https://github.com/Glazelf/NinigiBot/issues/139
module.exports = (day, month, year) => {
    return `${parseMonth(month)} ${day}, ${year}`;
};

const parseMonth = (month) => {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    return months[month];
};