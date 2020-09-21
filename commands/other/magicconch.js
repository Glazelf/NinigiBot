exports.run = (client, message) => {
    try {
        let args = message.content.split(` `);
        if (!args[1]) return message.channel.send(`> You need to provide something for the Magic Conch to consider, ${message.author}.`);

        const answers = ["Maybe someday", "Nothing", "Neither", "I don't think so", "No", "Yes", "Try asking again", "Definitely", "Probably not"];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

        return message.channel.send(`> The Magic Conch says: "${randomAnswer}.", ${message.author}.`);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "magicconch",
    aliases: []
};
