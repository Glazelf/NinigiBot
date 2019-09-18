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
    if (days !== 1) { multiDays = "s" };
    let multiHours = "";
    if (hours !== 1) { multiHours = "s" };
    let multiMinutes = "";
    if (minutes !== 1) { multiMinutes = "s" };
    let multiSeconds = "";
    if (seconds !== 1) { multiSeconds = "s" };

    // Import totals
    let totalStats = require('../events/ready');
    // var { totalMessages } = require('../events/ready');
    // var { totalCommands } = require('../events/ready');

    if (hours >= 24) {
        hours = hours - 24;
    };

    let uptime = `${hours} hour${multiHours}, ${minutes} minute${multiMinutes} and ${seconds} second${multiSeconds}`;

    if (days >= 1) {
        uptime = `${days} day${multiDays}, ${uptime}`;
    };

    return message.channel.send(`Here are some of the bot's statistics, <@${message.member.user.id}>:
Uptime: ${uptime}.
Servers: ${client.guilds.size}
Channels: ${client.channels.size}
Users: ${client.users.size}
    In that time, ${totalStats.totalMessages} messages have been sent and ${totalStats.totalCommands} commands have been used.`);
};

module.exports.help = {
    name: "Stats",
    description: "Displays various satistics about the bot.",
    usage: `stats`
};
