import Minesweeper from "discord.js-minesweeper";

export default (rows: any, columns: any, mines: any, bombEmoji: any) => {
    const minesweeper = new Minesweeper({
        rows: rows,
        columns: columns,
        mines: mines,
        emote: 'bomb',
        returnType: 'matrix',
    });
    let matrix = minesweeper.start();
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    matrix.forEach((arr: any) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i].replace("|| :bomb: ||", bombEmoji).replace("|| :zero: ||", "0️⃣").replace("|| :one: ||", "1️⃣").replace("|| :two: ||", "2️⃣").replace("|| :three: ||", "3️⃣").replace("|| :four: ||", "4️⃣").replace("|| :five: ||", "5️⃣").replace("|| :six: ||", "6️⃣").replace("|| :seven: ||", "7️⃣").replace("|| :eight: ||", "8️⃣");
        };
    });
    return matrix;
};