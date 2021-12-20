exports.run = async (client, message, args = []) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const fs = require('fs');
        const path = require('path');
        const capitalizeString = require('../../util/pokemon/capitalizeString');
        const randomNumber = require('../../util/randomNumber');

        if (!args[0]) return sendMessage(client, message, `You need to provide either a subcommand or a Monster to look up.`);

        let subCommand = args[0].toLowerCase();
        let subArgument;
        if (args[1]) subArgument = args.slice(1).join("-").replace(" ", "-").toLowerCase();


        switch (subCommand) {
            // Quests
            case "quest":

                break;


            // Default: Monsters
            default:
                let absoluteMonsterPath = path.resolve("./submodules/monster-hunter-DB/monsters.json");
                let rawData = fs.readFileSync(absoluteMonsterPath);
                let monstersJSON = JSON.parse(rawData);
                console.log(monstersJSON)

                break;
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "monsterhunter",
    aliases: ["monster"],
    description: "Shows Monster Hunter data.",
};