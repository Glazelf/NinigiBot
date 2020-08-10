const { search }  = require('../gifs/search');
exports.run = (client, message) => {
  try {
    Array.prototype.pick = function () {
      return this[Math.floor(Math.random() * this.length)];
    };

    let helpText = `> **Pokémon:**
    > Squirtle, Jigglypuff, Slowpoke, Flareon, Snorlax, Mewtwo, Mew, Wooper, Espeon, Scizor, Heracross, Celebi, Torchic, Lotad, Turtwig, Chimchar, Piplup, Shinx, Pachirisu, Gible, Glaceon, Gliscor, Gallade, Azelf, Oshawott, Maractus, Reshiram, Lurantis, Dracovish

    > **Not Pokémon:**
    > Dango, Jojo, Stitch

    > **Interactions/Emotions:**
    > Hug`;

    const Discord = require("discord.js");
    let user = message.mentions.users.first();
    let gifArgumentUncased = message.content.split(` `, 3);
    if (!gifArgumentUncased[1]) {
      return message.channel.send(`> You didn't provide a gif argument, so instead here's a list of the available ones, <@${message.author.id}>:

${helpText}`);
    }
    let gifArgument = gifArgumentUncased[1].toLowerCase();
    let gifArgumentCapitalized = gifArgument[0].toUpperCase() + gifArgument.substr(1);
    let gifString = `Here's your gif, <@${message.author.id}>`;

    

    const gif = search(gifArgument);

    
    if (gifArgument == "help") {
      return message.channel.send(`> Here's a list for all arguments that can return gifs, <@${message.author.id}>:

${helpText}`);
    } else if (!message.channel.permissionsFor(message.guild.me).has("ATTACH_FILES")) {
      return message.channel.send(`> I can't send you gifs because I don't have permissions to attach files to my messages, <@${message.author.id}>.`);
    } else if (gif) {
      let randomGif = gif.pick();

      if (gifArgument == "hug") {
        if (user) {
          gifString = `<@${message.author.id}> gave <@${user.id}> a tight hug!`;
          if (user == message.author) {
            gifString = `<@${user.id}> is hugging themselves... This is kind of sad...`;
          };
        } else {
          gifString = `It seems <@${message.author.id}> wants to hug...`;
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
      return message.channel.send(`> This argument has no gifs bound to it, so instead here's a list of the available arguments, <@${message.author.id}>:

${helpText}`);
    };

  } catch (e) {
    // log error
    console.log(e);

    // return confirmation
    return message.channel.send(`> An error has occurred trying to run the command, please report this as an issue on the Github page or send a message to the bot owner. For links and other information use ${client.config.prefix}info.`);
  };
};
