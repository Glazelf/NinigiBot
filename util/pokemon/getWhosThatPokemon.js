import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import Canvas from "canvas";
import { Dex } from '@pkmn/dex';
import urlExists from "../urlExists.js";
import getCleanPokemonID from "./getCleanPokemonID.js";
import getRandomObjectItem from "../getRandomObjectItem.js";
import { addMoney } from "../../database/dbServices/user.api.js";

export default async ({ pokemonList, winner, pokemon, reveal }) => {
    let pokemonButtons = new ActionRowBuilder();
    let doesRenderExist = false;
    let returnString = `# Who's That Pokémon?`;
    let pokemonID, serebiiRender;
    if (!pokemonList && pokemon) pokemon = Dex.species.get(pokemon); // In case a Pokémon is passed in instead of a list, this is the case on a correct answer
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
            returnString += `\n${winner} chose to reveal the answer.`;
        } else {
            // Format winning message update
            let pkmQuizPrize = 10;
            returnString += `\n${winner} guessed correctly and won ${pkmQuizPrize}${globalVars.currency}!`;
            addMoney(winner.id, pkmQuizPrize);
        };
        returnString += `\nThe answer was **${pokemon.name}**!`;
    } else {
        // Make render black
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, img.width, img.height);
    };
    let pokemonFiles = new AttachmentBuilder(canvas.toBuffer());

    const quizGuessButton = new ButtonBuilder()
        .setCustomId(`pkmQuizGuess|${pokemon.name}`)
        .setLabel("Guess")
        .setStyle(ButtonStyle.Primary);
    const quizRevealButton = new ButtonBuilder()
        .setCustomId(`pkmQuizReveal|${pokemon.name}`)
        .setLabel("Reveal")
        .setStyle(ButtonStyle.Secondary);
    pokemonButtons.addComponents([quizGuessButton, quizRevealButton]);
    return { content: returnString, files: [pokemonFiles], components: pokemonButtons };
};
