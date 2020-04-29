exports.run = (client, message) => {
    try {
        const Discord = require("discord.js");

        let user = message.mentions.users.first();

        if (!user) {
            return message.channel.send(`> You shoot wildly, but can't seem to hit anything.`);
        };

        return message.channel.send(`> Boom, headshot through <@${user.id}>'s skull.`);
    } catch (e) {
        // log error
        console.log(e);

        // return confirmation
        return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
    };
};

module.exports.help = {
    name: "Shoot",
    description: "Shoots Cris, somehow.",
    usage: `shoot`
};
