import randomNumber from "../math/randomNumber.js";

const visitors = [
    // [[[mc.facing, mc.x , mc.y],[shinx.facing, shinx.x , shinx.y]], ...]
    [[[2, 294, 171], [8, 290, 254]], [[3, 417, 121], [7, 479, 145]]],
    [[[0, 334, 238], [6, 388, 263]], [[2, 512, 238], [8, 455, 263]]],
    [[[0, 435, 278], [8, 496, 302]], [[3, 361, 125], [7, 295, 150]], [[3, 425, 125], [7, 486, 150]]],
    [[[1, 368, 134], [6, 362, 236]], [[1, 435, 134], [8, 436, 236]]],
];

export default () => {
    return visitors[randomNumber(0, visitors.length - 1)];
};