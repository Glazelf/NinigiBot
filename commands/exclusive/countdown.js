exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');

        let targetDate = new Date("Nov 20, 2021 19:47:00").getTime();
        let now = new Date().getTime();
        let distance = targetDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let returnString = `${days}d ${hours}h ${minutes}m ${seconds}s left.`;
        if (distance <= 0) returnString = `If you read this you have the big gay 😳.`;

        return sendMessage(client, interaction, returnString);

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "countdown",
    aliases: ["timeleft"],
    description: "Returns the time left remaining, duh.",
    serverID: "861884184787550218"
};