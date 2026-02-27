export default (day: any, month: any, year: any) => {
    return `${parseMonth(month)} ${day}, ${year}`;
};

const parseMonth = (month: any) => {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    return months[month];
};