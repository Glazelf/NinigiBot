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
    **Not Pokémon:**
    Dango, Jojo, Stitch, Kuzco
    **Interactions:**
    Hug`;

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
    aliases: []
};