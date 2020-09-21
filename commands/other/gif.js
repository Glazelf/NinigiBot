exports.run = (client, message) => {
  // Import globals
  let globalVars = require('../../events/ready');
  try {
    const { search } = require('../../gifs/search');

    let helpText = `> **Pokémon:**
    > Squirtle, Jigglypuff, Slowpoke, Flareon, Snorlax, Mewtwo, Mew, Wooper, Espeon, Scizor, Heracross, Celebi, Torchic, Lotad, Turtwig, Chimchar, Piplup, Shinx, Pachirisu, Gible, Glaceon, Gliscor, Gallade, Azelf, Oshawott, Maractus, Zweilous, Reshiram, Lurantis, Dracovish
    > **Not Pokémon:**
    > Dango, Jojo, Stitch, Kuzco
    > **Interactions:**
    > Hug`;

    const Discord = require("discord.js");
    let user = message.mentions.users.first();
    let gifArgumentUncased = message.content.split(` `, 3);
    let missingGifString = `> You didn't provide a valid gif argument, ${message.author}.
> For a list of gif arguments, use "${globalVars.prefix}gif help".`
    if (!gifArgumentUncased[1]) return message.channel.send(missingGifString);
    let gifArgument = gifArgumentUncased[1].toLowerCase();
    let gifArgumentCapitalized = gifArgument[0].toUpperCase() + gifArgument.substr(1);
    let gifString = `Here's your gif, ${message.author}:`;

    const gif = search(gifArgument);

    if (gifArgument == "help") {
      return message.channel.send(`> Here's a list for all gif arguments, ${message.author}:
${helpText}`);
    } else if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) {
      return message.channel.send(`> I can't send you gifs because I don't have permissions to attach files to my messages, ${message.author}.`);
    } else if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
      return message.channel.send(`> I can't send you gifs because I don't have permissions to embed messages, ${message.author}.`);
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

      let avatar = null;
      if (message.author.avatarURL()) avatar = message.author.avatarURL({ format: "png", dynamic: true });

      const gifEmbed = new Discord.MessageEmbed()
        .setColor(globalVars.embedColor)
        .setAuthor(`${gifArgumentCapitalized} Gif`, avatar)
        .setDescription(gifString)
        .setImage(gif)
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();

      return message.channel.send(gifEmbed);

    } else {
      return message.channel.send(missingGifString);
    };

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