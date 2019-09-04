exports.run = (client, message, args) => {
    // Calculate the uptime in days, hours, minutes, seconds
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    //figure out if the numbers given is different than 1
    let multiDays = "";
    if (days=1) {multiDays = ""} else{multiDays = "s"};
    let multiHours = "";
    if (hours=1) {multiHours = ""} else{multiHours = "s"};
    let multiMinutes = "";
    if (minutes=1) {multiMinutes = ""} else{multiMinutes = "s"};
    let multiSeconds = "";
    if (seconds=1) {multiSeconds = ""} else{multiSeconds = "s"};

    // Import totals
    var { totalMessages } = require('../events/ready');
    var { totalCommands } = require('../events/ready');

    if (hours >= 24) {
        hours = hours - 24;
    }

    if (days >= 1) {
        let uptime = `${days} day${multiDays}, ${hours} hour${multiHours}, ${minutes} minute${multiMinutes} and ${seconds} second${multiSeconds}.`;
        return message.channel.send(`This bot has been online for ${uptime}.
        WORK IN PROGRESS:
In that time, ${totalMessages} messages have been sent and ${totalCommands} commands have been used.`);
    } else {
        let uptime = `${hours} hour${multiHours}, ${minutes} minute${multiMinutes} and ${seconds} second${multiSeconds}.`;
        return message.channel.send(`This bot has been online for ${uptime}.
        WORK IN PROGRESS:
In that time, ${totalMessages} messages have been sent and ${totalCommands} commands have been used.`);
    }
};

module.exports.help = {
    name: "Uptime",
    description: "Displays the amount of time this bot has been online for.",
    usage: `uptime`
};
