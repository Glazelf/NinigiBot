import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";
import Canvas from "canvas";
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
    let pokemonButtons = new ActionRowBuilder();
    let doesRenderExist = false;
    let quizTitle = "Who's That Pokémon?";
    let quizDescription = null;
    let embedColor = globalVars.embedColor;
    let pokemonID, serebiiRender
    if (!pokemonList && pokemon) {
        pokemon = Dex.species.get(pokemon); // In case a Pokémon is passed in instead of a list, this is the case on a correct answer
        if (winner) {
            let pokemonSim = DexSim.species.get(pokemon.name);
            embedColor = colorHexes[pokemonSim.color.toLowerCase()];
        };
    };
    while (!doesRenderExist) {
        if (!pokemon && pokemonList) pokemon = getRandomObjectItem(pokemonList);
        pokemonID = getCleanPokemonID(pokemon);
        serebiiRender = `https://www.serebii.net/pokemon/art/${pokemonID}.png`;
        doesRenderExist = urlExists(serebiiRender);
        if (!doesRenderExist) pokemon = null; // Prevent infinite loop
    };
    // Initiate image context
    let img = await Canvas.loadImage(serebiiRender);
    let canvas = Canvas.createCanvas(img.width, img.height); // Serebii renders seem to always be 475x475
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    if (winner) {
        if (reveal == true) {
            quizDescription = `${winner} chose to reveal the answer.`;
        } else {
            // Format winning message update
            let pkmQuizPrize = 10;
            quizDescription = `${winner} guessed correctly and won ${pkmQuizPrize}${globalVars.currency}!`;
            addMoney(winner.id, pkmQuizPrize);
        };
        quizDescription += `\nThe answer was **${pokemon.name}**!`;
        pokemonButtons = [];
    } else {
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
    };
    let pokemonImage = new AttachmentBuilder(canvas.toBuffer(), { name: "WhosThatPokemon.jpg" });

    let quizEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(quizTitle)
        .setDescription(quizDescription)
        .setImage(`attachment://${pokemonImage.name}`);
    return { embeds: [quizEmbed], files: [pokemonImage], components: pokemonButtons };
};