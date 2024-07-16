import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandBooleanOption
} from "discord.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };

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
    if (rowsArg) rows = rowsArg;
    if (columnsArg) columns = columnsArg;

    let mines = Math.ceil((rows * columns) / 5); // ~20% mine ratio by default
    let minesArg = interaction.options.getInteger("mines");
    if (minesArg) {
        let minesCap = Math.ceil((rows * columns) / 2 - 1); // Cap at 50% mine ratio (otherwise board generation fails idk why)
        if (minesArg > minesCap || minesArg < minesFloor) {
            correctionString += `\nAmount of mines has to be between ${minesFloor} mine and ${minesCapPercentage}% of the board. Mine count has been adjusted to ${minesCap}.`;
            if (minesArg > minesCap) mines = minesCap;
            if (minesArg < minesFloor) mines = minesFloor;
        } else {
            mines = minesArg;
        };
    };
    let placeholderEmoji = "⬛";
    let buttonRowArray = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        let buttonRow = new ActionRowBuilder();
        for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
            const mineButton = new ButtonBuilder()
                .setCustomId(`minesweeper${rowIndex}-${columnIndex}-${placeholderEmoji}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(placeholderEmoji);
            buttonRow.addComponents(mineButton);
        };
        buttonRowArray.push(buttonRow);
    };

    let returnString = `Here is your minesweeper grid!`;
    if (correctionString.length > 0) {
        returnString += `\n${correctionString}`;
    } else {
        returnString += `\nMines: ${mines}`;
    };

    return sendMessage({ interaction: interaction, content: returnString, components: buttonRowArray, ephemeral: ephemeral });
};

let minGridLength = 2;
let maxGridLength = 5;
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
    .addBooleanOption(ephemeralOption);