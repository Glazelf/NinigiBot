module.exports = async ({ pokemonList, winner, pokemon }) => {
    const Discord = require("discord.js");
    const Canvas = require('canvas');
    const { Dex } = require('pokemon-showdown');
    const imageExists = require('../imageExists');
    const getCleanPokemonID = require('./getCleanPokemonID');
    const getRandomObjectItem = require('../getRandomObjectItem');
    let pokemonButtons = new Discord.ActionRowBuilder();
    let doesRenderExist = false;
    returnString = `# Who's That Pokémon?`;
    let pokemonID, serebiiRender;
    if (!pokemonList && pokemon) pokemon = Dex.species.get(pokemon); // In case a Pokémon is passed in instead of a list, this is the case on a correct answer
    while (!doesRenderExist) {
        if (!pokemon && pokemonList) pokemon = getRandomObjectItem(pokemonList);
        pokemonID = getCleanPokemonID(pokemon);
        serebiiRender = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        doesRenderExist = await imageExists(serebiiRender);
    };
    // Initiate image context
    let img = await Canvas.loadImage(serebiiRender);
    let canvas = Canvas.createCanvas(img.width, img.height); // Serebii renders seem to always be 475x475
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    if (winner) {
        // Format winning message update
        returnString += `\n${winner} guessed correctly!\nThe answer was **${pokemon.name}**!`;
    } else {
        // Make render black
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, img.width, img.height);
    };
    pokemonFiles = new Discord.AttachmentBuilder(canvas.toBuffer());

    pokemonButtons.addComponents(new Discord.ButtonBuilder({ customId: `pkmQuiz|${pokemon.name}`, label: "Guess!", style: Discord.ButtonStyle.Primary }));
    return { content: returnString, files: [pokemonFiles], components: [pokemonButtons] };
};