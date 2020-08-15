exports.run = (client, message) => {
  try {
    const { search }  = require('../gifs/search');

    Array.prototype.pick = function () {
      return this[Math.floor(Math.random() * this.length)];
    };

    let helpText = `> **Pokémon:**
    > Squirtle, Jigglypuff, Slowpoke, Flareon, Snorlax, Mewtwo, Mew, Wooper, Espeon, Scizor, Heracross, Celebi, Torchic, Lotad, Turtwig, Chimchar, Piplup, Shinx, Pachirisu, Gible, Glaceon, Gliscor, Gallade, Azelf, Oshawott, Maractus, Reshiram, Lurantis, Dracovish
    > **Not Pokémon:**
    > Dango, Jojo, Stitch, Kuzco
    > **Interactions:**
    > Hug`;

    const Discord = require("discord.js");
    let user = message.mentions.users.first();
    let gifArgumentUncased = message.content.split(` `, 3);
    let missingGifString = `> You didn't provide a valid gif argument, ${message.author}>.
> For a list of gif arguments, use "${client.config.prefix}gif help".`
    if (!gifArgumentUncased[1]) {
      return message.channel.send(missingGifString);
    }
    let gifArgument = gifArgumentUncased[1].toLowerCase();
    let gifArgumentCapitalized = gifArgument[0].toUpperCase() + gifArgument.substr(1);
    let gifString = `Here's your gif, ${message.author}`;

    

    const gif = search(gifArgument);

    
    if (gifArgument == "help") {
      return message.channel.send(`> Here's a list for all gif arguments, ${message.author}:
${helpText}`);
    } else if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) {
      return message.channel.send(`> I can't send you gifs because I don't have permissions to attach files to my messages, ${message.author}>.`);
    } else if (gif) {
      let randomGif = gif.pick();

      if (gifArgument == "hug") {
        if (user) {
          gifString = `${message.author} gave ${user} a tight hug!`;
          if (user == message.author) {
            gifString = `${user} is hugging themselves... This is kind of sad...`;
          };
        } else {
          gifString = `It seems ${message.author}> wants to hug...`;
        };
      };

      const gifEmbed = new Discord.MessageEmbed()
        .setColor("#219DCD")
        .setAuthor(`${gifArgumentCapitalized} Gif`, message.author.avatarURL())
        .setDescription(gifString)
        .setImage(randomGif)
        .setFooter(`Requested by ${message.author.tag}`)
        .setTimestamp();

      return message.channel.send(gifEmbed);

    } else {
      return message.channel.send(missingGifString);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};
