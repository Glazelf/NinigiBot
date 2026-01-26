import randomNumber from "../math/randomNumber.js";

const eating = [
    ['seems to like the food!', 3],
    ['is in love with this food!', 2],
    ['seems to be thinking about something while eating...', 1],
    ['is full. Finish your plate, cutie!', 8],
];

export default () => {
    return eating[randomNumber(0, eating.length - 1)];
};