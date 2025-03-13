import randomNumber from "../math/randomNumber.js";

const tapping = [
    ['is sleeping. Shh!', 1, 'a'],
    ['woke up! He wanted to sleep more...', 4, 8],
    ['! Time to wake up!', 8, 4]
];

export default () => {
    return tapping[randomNumber(0, tapping.length - 1)];
};