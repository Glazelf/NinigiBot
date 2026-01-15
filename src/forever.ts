import 'source-map-support/register.js';
import forever from 'forever-monitor';

// const foreverConfig = {
//     "root": "./forever/log"
// };
const foreverOptions = [{
    "uid": "Ninigi",
}];
forever.start('./build/bot.js', foreverOptions);