exports.run = async (client, message) => {
    // Import globals
    let globalVars = require('../../events/ready');
    try {
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

        let user = message.mentions.users.first();
        let gifArgumentUncased = message.content.split(` `, 3);
        let missingGifString = `You didn't provide a valid gif argument, ${message.author}.
> For a list of gif arguments, use \`${prefix}gif help\`.`;
        if (!gifArgumentUncased[1]) return message.reply(missingGifString);
        let gifArgument = gifArgumentUncased[1].toLowerCase();
        let gifArgumentCapitalized = gifArgument[0].toUpperCase() + gifArgument.substr(1);
        let gifString = `Here's your gif, ${message.author}:`;

        const gif = search(gifArgument);

        if (gifArgument == "help") {
            return message.reply(`Here's a list for all gif arguments, ${message.author}:
${helpText}`);
        } else if (gif) {
            if (gifArgument == "hug") {
                if (user) {
                    gifString = `${message.author} gave ${user} a tight hug!`;
                    if (user == message.author) {
                        gifString = `${user} is hugging themselves... This is kind of sad...`;
                    };
                } else {
                    gifString = `It seems ${message.author} wants to hug...`;
                };
            };

            let avatar = message.author.displayAvatarURL({ format: "png", dynamic: true });

            const gifEmbed = new Discord.MessageEmbed()
                .setColor(globalVars.embedColor)
                .setAuthor(`${gifArgumentCapitalized} Gif`, avatar)
                .setDescription(gifString)
                .setImage(gif)
                .setFooter(message.author.tag)
                .setTimestamp();

            return message.reply(gifEmbed);

        } else {
            return message.reply(missingGifString);
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

        // let avatar = message.author.displayAvatarURL({
        //     format: "png",
        //     dynamic: true
        // });

        // const gifEmbed = new Discord.MessageEmbed()
        //     .setColor(globalVars.embedColor)
        //     .setAuthor(`Gif (${args})`, avatar)
        //     .setDescription(`Here's your gif, ${message.author}:`)
        //     .setImage(randomGif)
        //     .setFooter(message.author.tag)
        //     .setTimestamp();

        // return message.reply(gifEmbed);

    } catch (e) {
        // log error
        const logger = require('../../util/logger');

        logger(e, client, message);
    };
};

module.exports.config = {
    name: "gif",
    aliases: [],
    description: "Returns a gif.",
    options: [{
        name: "pokemon",
        type: "SUB_COMMAND_GROUP",
        description: "Pokémon gifs.",
        options: [{
            name: "squirtle",
            type: "SUB_COMMAND",
            description: "Squirtle gif."
        }, {
            name: "jigglypuff",
            type: "SUB_COMMAND",
            description: "Jigglypuff gif."
        }, {
            name: "slowpoke",
            type: "SUB_COMMAND",
            description: "Slowpoke gif."
        }, {
            name: "flareon",
            type: "SUB_COMMAND",
            description: "Flareon gif."
        }, {
            name: "snorlax",
            type: "SUB_COMMAND",
            description: "Snorlax gif."
        }, {
            name: "mewtwo",
            type: "SUB_COMMAND",
            description: "Mewtwo gif."
        }, {
            name: "mew",
            type: "SUB_COMMAND",
            description: "Mew gif."
        }, {
            name: "wooper",
            type: "SUB_COMMAND",
            description: "Wooper gif."
        }, {
            name: "espeon",
            type: "SUB_COMMAND",
            description: "Espeon gif."
        }, {
            name: "scizor",
            type: "SUB_COMMAND",
            description: "Scizor gif."
        }, {
            name: "heracross",
            type: "SUB_COMMAND",
            description: "Heracross gif."
        }, {
            name: "celebi",
            type: "SUB_COMMAND",
            description: "Celebi gif."
        }, {
            name: "torchic",
            type: "SUB_COMMAND",
            description: "Torchic gif."
        }, {
            name: "lotad",
            type: "SUB_COMMAND",
            description: "Lotad gif."
        }, {
            name: "turtwig",
            type: "SUB_COMMAND",
            description: "Turtwig gif."
        }, {
            name: "chimchar",
            type: "SUB_COMMAND",
            description: "Chimchar gif."
        }, {
            name: "piplup",
            type: "SUB_COMMAND",
            description: "Piplup gif."
        }, {
            name: "shinx",
            type: "SUB_COMMAND",
            description: "Shinx gif."
        }, {
            name: "pachirisu",
            type: "SUB_COMMAND",
            description: "Pachirisu gif."
        }, {
            name: "gible",
            type: "SUB_COMMAND",
            description: "Gible gif."
        }, {
            name: "glaceon",
            type: "SUB_COMMAND",
            description: "Glaceon gif."
        }, {
            name: "gliscor",
            type: "SUB_COMMAND",
            description: "Gliscor gif."
        }, {
            name: "gallade",
            type: "SUB_COMMAND",
            description: "Gallade gif."
        }, {
            name: "azelf",
            type: "SUB_COMMAND",
            description: "Azelf gif."
        }, {
            name: "oshawott",
            type: "SUB_COMMAND",
            description: "Oshawott gif."
        }, {
            name: "maractus",
            type: "SUB_COMMAND",
            description: "Maractus gif."
        }, {
            name: "zweilous",
            type: "SUB_COMMAND",
            description: "Zweilous gif."
        }, {
            name: "reshiram",
            type: "SUB_COMMAND",
            description: "Reshiram gif."
        }, {
            name: "lurantis",
            type: "SUB_COMMAND",
            description: "Lurantis gif."
        }, {
            name: "dracovish",
            type: "SUB_COMMAND",
            description: "Dracovish gif."
        }]
    }, {
        name: "Interactions",
        type: "SUB_COMMAND_GROUP",
        description: "Interaction gifs.",
        options: [{
            name: "interaction",
            type: "SUB_COMMAND",
            description: "Hug gif."
        }]
    }, {
        name: "Other",
        type: "SUB_COMMAND_GROUP",
        description: "Other gifs.",
        options: [{
            name: "dango",
            type: "SUB_COMMAND",
            description: "Dango gif."
        }, {
            name: "jojo",
            type: "SUB_COMMAND",
            description: "Jojo gif."
        }, {
            name: "stitch",
            type: "SUB_COMMAND",
            description: "Stitch gif."
        }, {
            name: "kuzco",
            type: "SUB_COMMAND",
            description: "Kuzco gif."
        }]
    },]
};