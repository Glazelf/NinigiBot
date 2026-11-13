import {
    ActionRowBuilder,
    EmbedBuilder
} from "discord.js";
import randomNumber from "../math/randomNumber.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import pmdQuizQuestions from "../../objects/pokemon/pmdQuizQuestions.json" with {type: "json"};
import pmdQuizScoreDefault from "../../objects/pokemon/pmdQuizScoreDefault.json" with { type: "json"};

export default async ({ interaction, game, score = pmdQuizScoreDefault, previousQuestionNature }) => {
    let messageObject = {};
    let pmdGameQuestions = pmdQuizQuestions[game];

    let currentQuestionNature = "hardy";
    if (previousQuestionNature) currentQuestionNature = Object.keys(pmdQuizScoreDefault)[Object.keys(pmdQuizScoreDefault).indexOf(previousQuestionNature) + 1];
    let pmdGameQuestionsByNatureKeys = Object.keys(pmdGameQuestions).filter((key) => key.startsWith(currentQuestionNature));
    let randomQuestion = pmdGameQuestions[pmdGameQuestionsByNatureKeys[randomNumber(0, pmdGameQuestionsByNatureKeys.length - 1)]];
    let questionIndex = Object.keys(pmdQuizScoreDefault).indexOf(currentQuestionNature) + 1;

    let description = "";
    let answerCount = 0;
    randomQuestion.answers.forEach(answer => {
        answerCount++
        description += `${answerCount}. ${answer.answer}\n`;
    });

    let quizEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor)
        .setTitle(`#${questionIndex} ${randomQuestion.question}`)
        .setDescription(description);
    messageObject.embeds = [quizEmbed];
    return messageObject;
};