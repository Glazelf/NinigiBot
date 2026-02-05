export default (day: number, month: number, year: number): string => {
    return `${parseMonth(month)} ${day}, ${year}`;
};

const parseMonth = (month: number): string => {
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    return months[month];
};