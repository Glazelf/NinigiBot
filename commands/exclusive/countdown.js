exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        if (message.guild.id !== "861884184787550218") return;

        let targetDate = new Date("Aug 1, 2021 8:25:00").getTime();
        let now = new Date().getTime();
        let distance = targetDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let returnString = `${days}d ${hours}h ${minutes}m ${seconds}s left.`;
        if (distance <= 0) returnString = `If you read this you have the big gay 😳.`;

        return sendMessage(client, message, returnString);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "countdown",
    aliases: ["timeleft"],
    description: "Returns the time left remaining, duh."
};