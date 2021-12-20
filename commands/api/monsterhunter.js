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
        let subArgument = args.join(" ");

        switch (subCommand) {
            // Quests
            case "quest":
                break;

            // Default: Monsters
            default:
                // Load JSON
                let absoluteMonsterPath = path.resolve("./submodules/monster-hunter-DB/monsters.json");
                let rawData = fs.readFileSync(absoluteMonsterPath);
                let monstersJSON = JSON.parse(rawData);

                let monsterName = subArgument;

                // Get monster
                let monsterData;
                if (monsterName == "random") {
                    // Get random monster
                    let randomIndex = randomNumber(0, monstersJSON.monsters.length);
                    monsterData = monstersJSON.monsters[randomIndex];
                } else {
                    // Get named monster
                    await monstersJSON.monsters.forEach(monster => {
                        if (monster.name.toLowerCase() == monsterName) monsterData = monster;
                    });
                };

                if (!monsterData) return sendMessage(client, message, "Could not find the specified monster.");

                // Get icon, description and game appearances
                let monsterIcon;
                let monsterDescription;
                let gameAppearances = "";
                let mostRecentMainlineGame = "Monster Hunter Rise";
                let fallbackGame1 = "Monster Hunter World";
                let fallbackGame2 = "Monster Hunter Generations Ultimate";
                let mostRecentGameEntry = monsterData.games[monsterData.games.length - 1];
                await monsterData.games.forEach(game => {
                    gameAppearances += game.game + "\n"; // Add to game appearances list
                    // holy shit this is ugly but whatever
                    if (game.game == mostRecentMainlineGame) {
                        monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${game.image}?raw=true`;
                        monsterDescription = game.info;
                    } else if (game.game == fallbackGame1) {
                        monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${game.image}?raw=true`;
                        monsterDescription = game.info;
                    } else if (game.game == fallbackGame2) {
                        monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${game.image}?raw=true`;
                        monsterDescription = game.info;
                    };
                });
                // If it isn't in the most recent mainline game; instead use the most recent game it's been in
                if (!monsterIcon) monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${mostRecentGameEntry.image}?raw=true`;
                if (!monsterDescription) monsterDescription = mostRecentGameEntry.info

                // Make embed
                let monsterEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: monsterData.name })
                    .setThumbnail(monsterIcon);
                if (monsterDescription) monsterEmbed.setDescription(monsterDescription);
                monsterEmbed
                    .addField("Games:", gameAppearances)
                    .setFooter(message.member.user.tag)
                    .setTimestamp();

                return sendMessage(client, message, null, monsterEmbed)
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