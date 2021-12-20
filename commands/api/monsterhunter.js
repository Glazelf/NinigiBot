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
        const monstersJSON = require("../../submodules/monster-hunter-DB/monsters.json");
        const questsJSON = require("../../submodules/monster-hunter-DB/quests.json");
        const elementEmotes = require('../../objects/monsterhunter/elementEmotes.json');

        if (!args[0]) return sendMessage(client, message, `You need to provide either a subcommand or a Monster to look up.`);

        let subCommand = args[0].toLowerCase();
        let subArgument = args.join(" ").toLowerCase();

        switch (subCommand) {
            // Specific quest
            case "quest":
                if (!args[1]) return sendMessage(client, message, `You need to provide a quest name to show details of.`);
                let questNameArgument = args.slice(1).join(" ").toLowerCase();

                let questData;
                questsJSON.quests.forEach(quest => {
                    if (quest.name.toLowerCase() == questNameArgument) questData = quest;
                });

                // Format quest title
                let questTitle = `${questData.difficulty}⭐ ${questData.name}`;
                if (questData.isKey) questTitle += ` 🔑`;

                // Set up quest targets
                let targets = "";
                if (questData.targets.length > 1) {
                    questData.targets.forEach(target => {
                        if (targets.length == 0) {
                            targets = target;
                        } else {
                            targets += `, ${target}`;
                        };
                    });
                };

                // Make embed
                let questEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: questTitle })
                    .setDescription(`${questData.description} -${questData.client}`)
                    .addField("Game:", questData.game, true)
                    .addField("Type:", questData.questType, true)
                    .addField("Map:", questData.map, true)
                    .addField("Objective:", questData.objective, true);
                if (targets.length > 0) questEmbed.addField("Targets:", targets, true);
                questEmbed
                    .setFooter(message.member.user.tag)
                    .setTimestamp();

                return sendMessage(client, message, null, questEmbed);

            // All quests from a game
            case "quests":
                if (!args[1]) return sendMessage(client, message, `You need to provide a game to list quests from.`);
                let gameNameArgument = args.slice(1).join(" ").toLowerCase();

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
                let monsterWeaknesses = "";
                let monsterAilments = "";
                if (monsterData.elements) {
                    monsterData.elements.forEach(element => {
                        let elementString = `${elementEmotes[element]}${element}`;
                        if (monsterElements.length == 0) {
                            monsterElements = elementString;
                        } else {
                            monsterElements += `, ${elementString}`;
                        };
                    });
                };
                if (monsterData.weakness) {
                    monsterData.weakness.forEach(element => {
                        let elementString = `${elementEmotes[element]}${element}`;
                        if (monsterWeaknesses.length == 0) {
                            monsterWeaknesses = elementString;
                        } else {
                            monsterWeaknesses += `, ${elementString}`;
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

                // Make embed
                let monsterEmbed = new Discord.MessageEmbed()
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: `${monsterData.name} (${monsterData.type})` })
                    .setThumbnail(monsterIcon);
                if (monsterDescription) monsterEmbed.setDescription(monsterDescription);
                monsterEmbed
                    .addField("Size:", monsterSize, true)
                if (monsterDanger) monsterEmbed.addField("Danger:", monsterDanger, true);
                if (monsterElements.length > 0) monsterEmbed.addField("Element(s):", monsterElements, true);
                if (monsterWeaknesses.length > 0) monsterEmbed.addField("Weakness(es):", monsterWeaknesses, true);
                if (monsterAilments.length > 0) monsterEmbed.addField("Ailment(s):", monsterAilments, true);
                monsterEmbed
                    .addField("Game(s):", gameAppearances, false)
                    .setFooter(message.member.user.tag)
                    .setTimestamp();

                return sendMessage(client, message, null, monsterEmbed);
        };

    } catch (e) {
        // Log error
        logger(e, client, message);
    };
};

module.exports.config = {
    name: "monsterhunter",
    aliases: ["monster", "mh"],
    description: "Shows Monster Hunter data.",
    options: [{
        name: "quest",
        type: "SUB_COMMAND",
        description: "Get info on a specific quest.",
        options: [{
            name: "ability-name",
            type: "STRING",
            description: "Specify quest by name.",
        }]
    },
    {
        name: "quests",
        type: "SUB_COMMAND",
        description: "List all quests from a game.",
        options: [{
            name: "game-name",
            type: "STRING",
            description: "Specify game by name or abbreviation.",
        }]
    },
    {
        name: "monster-name",
        type: "STRING",
        description: "Specify monster by name."
    }]
};