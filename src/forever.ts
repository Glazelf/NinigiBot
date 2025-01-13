// @ts-ignore
import forever from 'forever-monitor';
// import forevermonitor from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions = [{
    "uid": "Ninigi",
}];
const child = forever.start('./bot.js', foreverOptions);
forever.startServer(child);