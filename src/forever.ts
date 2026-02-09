import forever from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions: any = [{
    "uid": "Ninigi",
}];
const child = forever.start('./dist/bot.js', foreverOptions);