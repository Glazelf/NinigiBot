exports.run = (client, message, args) => {
    // Calculate the uptime in days, hours, minutes, seconds
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    if (hours >= 24) {
        hours = hours - 24;
    }

    if (days >= 1) {
        let uptime = `${days} day(s), ${hours} hour(s), ${minutes} minute(s) and ${seconds} second(s)`;
        return message.channel.send(`This bot has been online for ${uptime}`);
    } else {
        let uptime = `${hours} hour(s), ${minutes} minute(s) and ${seconds} second(s).`;
        return message.channel.send(`This bot has been online for ${uptime}
In that time, ${totalMessages} messages have been sent and ${totalCommands} commands have been used.`);
    }
};

module.exports.help = {
    name: "Uptime",
    description: "Displays the amount of time this bot has been online for.",
    usage: `uptime`
};
