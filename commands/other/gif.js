exports.run = async (client, message, args = [], language) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const getLanguageString = require('../../util/getLanguageString');
        const Discord = require("discord.js");
        const { search } = require('../../util/search');
        const { Prefixes } = require('../../database/dbObjects');
        let prefix = await Prefixes.findOne({ where: { server_id: message.guild.id } });
        if (prefix) {
            prefix = prefix.prefix;
        } else {
            prefix = globalVars.prefix;
        };

        let helpText = `**Pokémon:**
Squirtle, Jigglypuff, Slowpoke, Flareon, Snorlax, Mewtwo, Mew, Wooper, Espeon, Scizor, Heracross, Celebi, Torchic, Lotad, Turtwig, Chimchar, Piplup, Shinx, Pachirisu, Gible, Glaceon, Gliscor, Gallade, Azelf, Oshawott, Maractus, Zweilous, Reshiram, Lurantis, Dracovish
**Interactions:**
Hug
**Other:**
Dango, Jojo, Stitch, Kuzco`;

        let user;
        if (message.mentions && (message.mentions.members.size > 0 || message.mentions.repliedUser)) {
            user = message.mentions.users.first();
        };
        let author;
        if (message.type == 'DEFAULT') {
            author = message.author;
        } else {
            author = message.member.user;
        };
        let missingGifString = `You didn't provide a valid gif argument.\nFor a list of gif arguments, use \`${prefix}gif help\`.`;
        if (!args[0]) return sendMessage(client, message, missingGifString);
        let gifArgument = args[0].toLowerCase();
        let gifArgumentCapitalized = gifArgument[0].toUpperCase() + gifArgument.substr(1);
        let gifString = `Here's your gif:`;

        const gif = search(gifArgument);

        if (gifArgument == "help") {
            return sendMessage(client, message, `Here's a list for all gif arguments:\n${helpText}`);
        } else if (gif) {
            if (gifArgument == "hug") {
                if (user) {
                    gifString = `${message.member} gave ${user} a tight hug!`;
                    if (user == author) {
                        gifString = `${user} is hugging themselves... This is kind of sad...`;
                    };
                } else {
                    gifString = `It seems ${message.member} wants to hug...`;
                };
            };

            let avatar = author.displayAvatarURL(globalVars.displayAvatarSettings);

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${gifArgumentCapitalized} Gif`, avatar)
                .setDescription(gifString)
                .setImage(gif)
                .setFooter(author.tag)
                .setTimestamp();

            return sendMessage(client, message, null, gifEmbed);

        } else {
            return sendMessage(client, message, missingGifString);
        };

        // Using random giphy requests, but the matching is horrible if you even get a match at all
        // const giphyRandom = require("giphy-random");

        // args = args.join(" ");

        // const getRandomGif = async () => {
        //     const { data } = await giphyRandom(client.config.giphy, {
        //         tag: args
        //     });
        //     return data.image_url;
        // };

        // const randomGif = await getRandomGif();

        // let avatar = author.displayAvatarURL({
        //     format: "png",
        //     dynamic: true
        // });

        // const gifEmbed = new Discord.MessageEmbed()
        //     .setColor(globalVars.embedColor)
        //     .setAuthor(`Gif (${args})`, avatar)
        //     .setDescription(`Here's your gif, ${message.member}:`)
        //     .setImage(randomGif)
        //     .setFooter(author.tag)
        //     .setTimestamp();

        // return sendMessage(client, message, gifEmbed);

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "gif",
    aliases: [],
    description: "Returns a gif.",
    options: [{
        name: "pokemon",
        type: "STRING",
        description: "Pokémon gifs.",
    }, {
        name: "interactions",
        type: "STRING",
        description: "Interaction gifs.",
    }, {
        name: "other",
        type: "STRING",
        description: "Other gifs.",
    }]
};