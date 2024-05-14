module.exports = async ({ pokemonList, censor }) => {
    const Discord = require("discord.js");
    const Canvas = require('canvas');
    const imageExists = require('../imageExists');
    const getCleanPokemonID = require('./getCleanPokemonID');
    const getRandomObjectItem = require('../getRandomObjectItem');
    let pokemonButtons = new Discord.ActionRowBuilder();
    let doesRenderExist = false;
    let pokemon, pokemonID, serebiiRender;
    while (!doesRenderExist) {
        pokemon = getRandomObjectItem(pokemonList);
        pokemonID = getCleanPokemonID(pokemon);
        serebiiRender = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        doesRenderExist = await imageExists(serebiiRender);
    };
    // Initiate image context
    let img = await Canvas.loadImage(serebiiRender);
    let canvas = Canvas.createCanvas(img.width, img.height); // Serebii renders seem to always be 475x475
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Make render black
    if (censor == true) {
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, img.width, img.height);
    };
    pokemonFiles = new Discord.AttachmentBuilder(canvas.toBuffer());
    returnString = `# Who's That Pokémon?`;
    pokemonButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmQuiz|${pokemon.name}`, label: "Guess!", style: Discord.ButtonStyle.Primary }));
    return { content: returnString, files: [pokemonFiles], components: [pokemonButtons] };
};