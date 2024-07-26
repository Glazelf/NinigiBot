import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import increaseByPercentageForEach from "../../util/math/increaseByPercentageForEach.js";
import {
    getMoney,
    addMoney
} from "../../database/dbServices/user.api.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

const minGridLength = 2;
const maxGridLength = 5;
const profitPerMine = 10; // 10% gain per mine on won bet

export default async (interaction, ephemeral) => {
    let ephemeralArg = interaction.options.getBoolean("ephemeral");
    if (ephemeralArg !== null) ephemeral = ephemeralArg;
    let correctionString = "";
    let rows = 5;
    let columns = 5;
    let minesFloor = 1;
    let minesCapPercentage = 50;
    let rowsArg = interaction.options.getInteger("rows");
    let columnsArg = interaction.options.getInteger("columns");
    let bet = interaction.options.getInteger("bet");
    let betGain = 0;
    if (rowsArg) rows = rowsArg;
    if (columnsArg) columns = columnsArg;

    let mines = Math.ceil((rows * columns) / 5); // ~20% mine ratio by default
    let minesArg = interaction.options.getInteger("mines");
    if (minesArg) {
        let minesCap = Math.ceil((rows * columns) / 2 - 1); // Cap at 50% mine ratio (otherwise board generation fails idk why)
        if (minesArg > minesCap || minesArg < minesFloor) {
            correctionString += `\nAmount of mines has to be between ${minesFloor} mine and ${minesCapPercentage}% of the board.`;
            if (minesArg > minesCap) mines = minesCap;
            if (minesArg < minesFloor) mines = minesFloor;
        } else {
            mines = minesArg;
        };
    };

    if (bet) {
        let minimumMinesBet = 4;
        const currentBalance = await getMoney(interaction.user.id);
        if (mines < minimumMinesBet) return sendMessage({ interaction: interaction, content: `${correctionString}\nYou are only allowed to place bets with at least ${minimumMinesBet} mines to ensure the game does not favor luck or is too easy.`, ephemeral: true });
        if (bet > currentBalance) return sendMessage({ interaction: interaction, content: `You only have ${currentBalance}.`, ephemeral: true });
        betGain = increaseByPercentageForEach(bet, mines, profitPerMine);
        addMoney(interaction.user.id, -bet);
        correctionString += `\nYou bet ${bet}${globalVars.currency}.\nIf you win you will receive ${betGain}${globalVars.currency}.`;
    } else {
        bet = 0;
    };

    let placeholderEmoji = "⬛";
    let buttonRowArray = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        let buttonRow = new ActionRowBuilder();
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            const mineButton = new ButtonBuilder()
                .setCustomId(`minesweeper${rowIndex}-${columnIndex}-${placeholderEmoji}-${mines}-${bet}-${betGain}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(placeholderEmoji);
            buttonRow.addComponents(mineButton);
        };
        buttonRowArray.push(buttonRow);
    };

    let returnString = `## Here is your Minesweeper grid!`;
    if (correctionString.length > 0) returnString += `\n${correctionString}`;
    returnString += `\nMines: ${mines}`;

    return sendMessage({ interaction: interaction, content: returnString, components: buttonRowArray, ephemeral: ephemeral });
};

// Integer options
const minesOption = new SlashCommandIntegerOption()
    .setName("mines")
    .setDescription("Amount of mines.")
    .setMinValue(1)
    .setMaxValue(12);
const rowsOption = new SlashCommandIntegerOption()
    .setName("rows")
    .setDescription("Amount of rows.")
    .setMinValue(minGridLength)
    .setMaxValue(maxGridLength);
const columnsOption = new SlashCommandIntegerOption()
    .setName("columns")
    .setDescription("Amount of columns.")
    .setMinValue(minGridLength)
    .setMaxValue(maxGridLength);
const betOption = new SlashCommandIntegerOption()
    .setName("bet")
    .setDescription(`Amount of money to bet. Profit is ${profitPerMine}% per mine.`)
    .setMinValue(1)
    .setAutocomplete(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("minesweeper")
    .setDescription("Play minesweeper.")
    .addIntegerOption(minesOption)
    .addIntegerOption(rowsOption)
    .addIntegerOption(columnsOption)
    .addIntegerOption(betOption)
    .addBooleanOption(ephemeralOption);
