import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    bold
} from "discord.js";
import Canvas from "canvas";
import axios from "axios";
import { Dex } from '@pkmn/dex';
import { Dex as DexSim } from '@pkmn/sim';
import urlExists from "../urlExists.js";
import getCleanPokemonID from "./getCleanPokemonID.js";
import getRandomObjectItem from "../math/getRandomObjectItem.js";
import { addMoney } from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import colorHexes from "../../objects/colorHexes.json" with { type: "json" };

// Winner = person who ended the game, either through reveal or guessing correctly
export default async ({ pokemonList, winner, pokemon, reveal }) => {
    let messageObject = {};
    let pokemonButtons = new ActionRowBuilder();
    let doesRenderExist = false;
    let quizTitle = "Who's That Pokémon?";
    let quizDescription = null;
    let embedColor = globalVars.embedColor;
    let pokemonID, serebiiRender, pokemonImage;
    if (!pokemonList && pokemon) {
        pokemon = Dex.species.get(pokemon); // In case a Pokémon is passed instead of a list. This happens if the user guesses correctly.
        if (winner) {
            let pokemonSim = DexSim.species.get(pokemon.name);
            embedColor = colorHexes[pokemonSim.color.toLowerCase()];
        };
    };
    // Loop through until a valid render is found
    while (!doesRenderExist) {
        if (!pokemon && pokemonList) pokemon = getRandomObjectItem(pokemonList);
        pokemonID = getCleanPokemonID(pokemon);
        serebiiRender = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        doesRenderExist = urlExists(serebiiRender);
        if (!doesRenderExist) pokemon = null; // Prevent infinite loop
    };
    let embedImage = serebiiRender;
    // If game has ended
    if (winner) {
        // If user chose to reveal the answer
        if (reveal == true) {
            quizDescription = `${winner} chose to reveal the answer.`;
        } else {
            // Format winning message update for correct guess
            let pkmQuizPrize = 10;
            quizDescription = `${winner} guessed correctly and won ${pkmQuizPrize}${globalVars.currency}!`;
            addMoney(winner.id, pkmQuizPrize);
        };
        quizDescription += `\nThe answer was ${bold(pokemon.name)}!`;
        messageObject.files = [];
        messageObject.components = [];
    } else {
        // Construct a black render, this forces us to load in the image entirely instead of just passing the URL :(
        // Initiate image context. If "socket hang up" error occurs, error seems to be in this block of code.
        let imageBuffer = await axios.get(serebiiRender, { responseType: 'arraybuffer' }).then(response => response.data);
        let img = new Canvas.Image();
        img.src = imageBuffer;
        let canvas = Canvas.createCanvas(img.width, img.height); // Serebii renders seem to always be 475x475
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Make render black
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, img.width, img.height);
        // Add buttons
        const quizGuessButton = new ButtonBuilder()
            .setCustomId(`pkmQuizGuess|${pokemon.name}`)
            .setLabel("Guess")
            .setStyle(ButtonStyle.Primary);
        const quizRevealButton = new ButtonBuilder()
            .setCustomId(`pkmQuizReveal|${pokemon.name}`)
            .setLabel("Reveal")
            .setStyle(ButtonStyle.Danger);
        pokemonButtons.addComponents([quizGuessButton, quizRevealButton]);
        pokemonImage = new AttachmentBuilder(canvas.toBuffer(), { name: "WhosThatPokemon.jpg" });
        embedImage = `attachment://${pokemonImage.name}`;
        messageObject.files = [pokemonImage];
        messageObject.components = [pokemonButtons];
    };

    let quizEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(quizTitle)
        .setDescription(quizDescription)
        .setImage(embedImage);
    messageObject.embeds = [quizEmbed];
    return messageObject;
};