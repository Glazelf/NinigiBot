import forever from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions = [{
    "uid": "Ninigi",
}];
const child = forever.start('./build/bot.js', foreverOptions);