const eating =
    [
        ['seems to like the food!', 3],
        ['is in love with this food!', 2],
        ['seems to be thinking about something while eating...', 1],
        ['is full. Finish your plate, cutie!', 8],
    ];

module.exports = () => {
    return eating[Math.floor(Math.random() * eating.length)];
};