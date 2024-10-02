import forever from 'forever';
// import forevermonitor from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions = [{
    "uid": "Ninigi",
}];
const child = forever.start('./bot.js', foreverOptions);
forever.startServer(child);