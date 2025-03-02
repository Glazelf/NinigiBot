import randomNumber from "../math/randomNumber.js";

const playing = [
    ['doesn\'t feel well...', 8, 0],
    ['likes the fresh air here!', 3, 1],
    ['is so happy about seeing his friends!', 2, 1.2],
    ['seems to be singing something!', 0, 0.9],
    ['seems a bit shy with those other Shinxes. Oh boy...', 8, 0.4]
];

export default (index = -1) => {
    return index != -1 ? playing[index] : playing[randomNumber(0, playing.length - 1)];
};