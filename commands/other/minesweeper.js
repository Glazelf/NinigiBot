exports.run = async (client, interaction, args = interaction.options._hoistedOptions) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const Minesweeper = require('discord.js-minesweeper');

        let rows = 5;
        let columns = 5;
        let rowsArg = args.find(element => element.name == "rows");
        let columnsArg = args.find(element => element.name == "columns");
        if (rowsArg) {
            if (rowsArg.value <= 5 && rowsArg.value >= 2) rows = rowsArg.value;
        };
        if (columnsArg) {
            if (columnsArg.value <= 5 && columnsArg.value >= 2) columns = columnsArg.value;
        };

        let mines = Math.ceil((rows * columns) / 5); // ~20% mine ratio by default
        let minesArg = args.find(element => element.name == "mines");
        if (minesArg) {
            if (minesArg.value >= Math.ceil((rows * columns) / 100 * 50 - 1)) {
                mines = Math.ceil((rows * columns) / 100 * 50 - 1); // Cap at 50% mine ratio (otherwise board generation fails idk why)
            } else if (minesArg.value >= 1) {
                mines = minesArg.value;
            };
        };

        const minesweeper = new Minesweeper({
            rows: rows,
            columns: columns,
            mines: mines,
            emote: 'bomb',
            returnType: 'matrix',
        });

        let bombEmote = "💣";
        let spoilerEmote = "⬛";

        let matrix = minesweeper.start();
        matrix.forEach(arr => {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].replace("|| :bomb: ||", bombEmote).replace("|| :zero: ||", "0️⃣").replace("|| :one: ||", "1️⃣").replace("|| :two: ||", "2️⃣").replace("|| :three: ||", "3️⃣").replace("|| :four: ||", "4️⃣").replace("|| :five: ||", "5️⃣").replace("|| :six: ||", "6️⃣").replace("|| :seven: ||", "7️⃣").replace("|| :eight: ||", "8️⃣");
            };
        });

        let buttonRowArray = [];
        let buttonIndex = 0;
        let rowIndex = 0;
        matrix.forEach(arr => {
            let buttonRow = new Discord.MessageActionRow();
            arr.forEach(element => {
                buttonRow.addComponents(new Discord.MessageButton({ customId: `minesweeper${rowIndex}-${buttonIndex}-${element}-${interaction.member.id}`, style: 'PRIMARY', emoji: spoilerEmote }));
                buttonIndex += 1;
            });
            rowIndex += 1;
            buttonRowArray.push(buttonRow);
        });

        let returnString = `Here is your minesweeper grid, **${interaction.member.user.tag}**.`;
        return sendMessage({ client: client, interaction: interaction, content: returnString, components: buttonRowArray });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

module.exports.config = {
    name: "minesweeper",
    aliases: [],
    description: "Play minesweeper.",
    options: [{
        name: "mines",
        type: "INTEGER",
        description: "Amount of mines."
    }, {
        name: "rows",
        type: "INTEGER",
        description: "Amount of rows."
    }, {
        name: "columns",
        type: "INTEGER",
        description: "Amount of columns."
    }]
};