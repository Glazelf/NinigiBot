const forever = require('forever');
const forevermonitor = require('forever-monitor');

let foreverConfig = {
    "root": "./forever/log"
};

let foreverOptions = [{
    "uid": "Ninigi",
}];

let child = forever.start('./bot.js', foreverOptions);

forever.startServer(child);