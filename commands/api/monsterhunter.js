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

        // Load JSON
        let monstersJSON = require("../../submodules/monster-hunter-DB/monsters.json");
        const elementEmotes = require('../../objects/monsterhunter/elementEmotes.json');

        if (!args[0]) return sendMessage(client, message, `You need to provide either a subcommand or a Monster to look up.`);

        let subCommand = args[0].toLowerCase();
        let subArgument = args.join(" ");

        switch (subCommand) {
            // Quests
            case "quest":
                return sendMessage(client, message, "Quest searching has not been implemented yet! Try searching a monster for now.");

            // Default: Monsters
            default:
                let monsterName = subArgument;

                // Get monster
                let monsterData;
                if (monsterName == "random") {
                    // Get random monster
                    let randomIndex = randomNumber(0, monstersJSON.monsters.length);
                    monsterData = monstersJSON.monsters[randomIndex];
                } else {
                    // Get named monster
                    monstersJSON.monsters.forEach(monster => {
                        if (monster.name.toLowerCase() == monsterName) monsterData = monster;
                    });
                };

                if (!monsterData) return sendMessage(client, message, "Could not find the specified monster.");

                // Get icon, description and game appearances
                let monsterIcon;
                let monsterDescription;
                let monsterDanger;
                let gameAppearances = "";
                let mostRecentMainlineGame = "Monster Hunter Rise";
                let fallbackGame1 = "Monster Hunter World";
                let fallbackGame2 = "Monster Hunter Generations Ultimate";
                let mostRecentGameEntry = monsterData.games[monsterData.games.length - 1];
                monsterData.games.forEach(game => {
                    // Add to game appearances list
                    gameAppearances += game.game + "\n";
                    // Works because games are in chronological order
                    if (game.game == mostRecentMainlineGame || game.game == fallbackGame1 || game.game == fallbackGame2) {
                        monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${game.image}?raw=true`;
                        monsterDescription = game.info;
                        monsterDanger = game.danger;
                    };
                });
                // If it isn't in the most recent mainline game; instead use the most recent game it's been in
                if (!monsterIcon) monsterIcon = `https://github.com/CrimsonNynja/monster-hunter-DB/blob/master/icons/${mostRecentGameEntry.image}?raw=true`;
                if (!monsterDescription) monsterDescription = mostRecentMainlineGame.info;
                if (!monsterDanger) monsterDanger = mostRecentGameEntry.danger;

                // Format size
                let monsterSize = "Small";
                if (monsterData.isLarge) monsterSize = "Large";
                // Get elements, ailments and weaknesses
                let monsterElements = "";
                let monsterAilments = "";
                let monsterWeaknesses = "";
                if (monsterData.elements) {
                    monsterData.elements.forEach(element => {
                        if (monsterElements.length == 0) {
                            monsterElements = element;
                        } else {
                            monsterElements += `, ${element}`;
                        };
                    });
                };
                if (monsterData.ailments) {
                    monsterData.ailments.forEach(ailment => {
                        if (monsterAilments.length == 0) {
                            monsterAilments = ailment;
                        } else {
                            monsterAilments += `, ${ailment}`;
                        };
                    });
                };
                if (monsterData.weakness) {
                    monsterData.weakness.forEach(weakness => {
                        if (monsterWeaknesses.length == 0) {
                            monsterWeaknesses = weakness;
                        } else {
                            monsterWeaknesses += `, ${weakness}`;
                        };
                    });
                };

                // Make embed
                let monsterEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: monsterData.name })
                    .setThumbnail(monsterIcon);
                if (monsterDescription) monsterEmbed.setDescription(monsterDescription);
                monsterEmbed
                    .addField("Size:", monsterSize, true)
                    .addField("Species:", monsterData.type, true);
                if (monsterDanger) monsterEmbed.addField("Danger:", monsterDanger, true);
                if (monsterElements.length > 0) monsterEmbed.addField("Element(s):", monsterElements, true);
                if (monsterAilments.length > 0) monsterEmbed.addField("Ailment(s):", monsterAilments, true);
                if (monsterWeaknesses.length > 0) monsterEmbed.addField("Weakness(es):", monsterWeaknesses, true);
                monsterEmbed
                    .addField("Game(s):", gameAppearances, true)
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