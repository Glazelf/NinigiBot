module.exports = async (hp) => {
    if (hp == 0) return 'a';
    return [color(hp), size(hp)]
};

const color = hp => {
    if (hp < 0.5) return 0;
    if (0.5 <= hp && hp < 0.75) return 1;
    if (0.75 <= hp && hp <= 1) return 2;
    if (1 <= hp && hp <= 2) return 3;
    else return 4
};

const size = hp => {
    return Math.floor(hp * 96) % 97
};