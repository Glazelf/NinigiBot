const tapping = [
    ['is sleeping. Shh!', 1, 'a'],
    ['woke up! He wanted to sleep more...', 4, 8],
    ['! Time to wake up!', 8, 4]
];

module.exports = () => {
    return tapping[Math.floor(Math.random() * tapping.length)];
};