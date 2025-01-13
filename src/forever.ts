
// @ts-expect-error TS(7016): Could not find a declaration file for module 'fore... Remove this comment to see the full error message
import forever from 'forever-monitor';
// import forevermonitor from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions = [{
    "uid": "Ninigi",
}];
const child = forever.start('./bot.js', foreverOptions);