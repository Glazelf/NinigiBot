exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");

        const Minesweeper = require('discord.js-minesweeper');
        const minesweeper = new Minesweeper({
            rows: 5,
            columns: 5,
            mines: 6,
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
                buttonRow.addComponents(new Discord.MessageButton({ customId: `minesweeper${rowIndex}-${buttonIndex}-${element}-${message.author.id}`, style: 'PRIMARY', emoji: spoilerEmote }));
                buttonIndex += 1;
            });
            rowIndex += 1;
            buttonRowArray.push(buttonRow);
        });

        return sendMessage({ client: client, message: message, content: `Here is your minesweeper grid, **${message.author.tag}**:`, components: buttonRowArray });

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "minesweeper",
    aliases: [],
    description: "Play minesweeper."
};