import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    bold
} from "discord.js";
import { Dex } from '@pkmn/dex';
import { Dex as DexSim } from '@pkmn/sim';
import getRandomObjectItem from "../math/getRandomObjectItem.js";
import rewardMoney from "../db/rewardMoney.js";
import formatNumber from "../math/formatNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import colorHexes from "../../objects/colorHexes.json" with { type: "json" };

// A lot of the code below is copied from getPokemon.js
// Winner = person who ended the game, either through reveal or guessing correctly
export default async ({ interaction, winner, stoneList, stone, reveal }) => {
    let messageObject: any = {};
    let pokemonButtons = new ActionRowBuilder();
    let quizTitle = "Who uses this mega stone?";
    let quizDescription = null;
    let pokemon = null;
    let embedColor = globalVars.embedColor;
    if (!stoneList && stone) {
        pokemon = Dex.species.get(Object.keys(stone.megaStone)[0]);
        if (winner) {
            let pokemonSim = DexSim.species.get(Object.keys(stone.megaStone)[0]);
            embedColor = colorHexes[pokemonSim.color.toLowerCase()];
        };
    };
    if (!stone && stoneList) stone = getRandomObjectItem(stoneList);
    // If game has ended
    if (winner) {
        // If user chose to reveal the answer
        if (reveal == true) {
            quizDescription = `${winner} chose to reveal the answer.`;
        } else {
            // Format winning message update for correct guess
            let megaQuizPrize = 20;
            quizDescription = `${winner} guessed correctly and won ${formatNumber(megaQuizPrize, interaction.locale)}${globalVars.currency}.`;
            let rewardData = await rewardMoney({ application: interaction.client.application, userID: winner.id, reward: megaQuizPrize });
            if (rewardData.isSubscriber) quizDescription += `\n${winner} ${rewardData.rewardString}`;
        };
        quizDescription += `\nThe answer was ${bold(Object.keys(stone.megaStone)[0])}.\nThe item shown is the ${bold(stone.name)}.`;
        messageObject.files = [];
        messageObject.components = [];
    } else {
        // Add buttons
        const quizGuessButton = new ButtonBuilder()
            .setCustomId(`megaQuizGuess|${stone.name}`)
            .setLabel("Guess")
            .setStyle(ButtonStyle.Primary);
        const quizRevealButton = new ButtonBuilder()
            .setCustomId(`megaQuizReveal|${stone.name}`)
            .setLabel("Reveal")
            .setStyle(ButtonStyle.Danger);
        pokemonButtons.addComponents([quizGuessButton, quizRevealButton]);
        messageObject.components = [pokemonButtons];
    };

    let quizEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(quizTitle)
        .setDescription(quizDescription)
        .setImage(`https://www.serebii.net/itemdex/sprites/za/${stone.id}.png`);
    messageObject.embeds = [quizEmbed];
    return messageObject;
};