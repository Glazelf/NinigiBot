exports.run = async (client, interaction) => {
    const logger = require('../../util/logger');
    // Import globals
    let globalVars = require('../../events/ready');
    try {
        const sendMessage = require('../../util/sendMessage');
        const Discord = require("discord.js");
        const randomNumber = require('../../util/randomNumber');
        const capitalizeString = require('../../util/capitalizeString');
        const isAdmin = require('../../util/isAdmin');
        const getMonster = require('../../util/mh/getMonster');
        const monstersJSON = require("../../submodules/monster-hunter-DB/monsters.json");
        const questsJSON = require("../../submodules/monster-hunter-DB/quests.json");
        const elementEmotes = require('../../objects/monsterhunter/elementEmotes.json');

        let adminBot = isAdmin(client, interaction.guild.members.me);
        let ephemeral = interaction.options.getBoolean("ephemeral");
        if (ephemeral === null) ephemeral = true;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has("USE_EXTERNAL_EMOJIS") && !adminBot) emotesAllowed = false;

        let buttonArray = [];
        let mhEmbed = new Discord.MessageEmbed()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            // Specific quest
            case "quest":
                let questName = interaction.options.getString("quest").toLowerCase();
                let questData;
                questsJSON.quests.forEach(quest => {
                    if (quest.name.toLowerCase() == questName) questData = quest;
                });
                if (!questData) return sendMessage({ client: client, interaction: interaction, content: "Could not find the specified quest." });
                // Format quest title
                let questTitle = `${questData.difficulty}⭐ ${questData.name}`;
                if (questData.isKey) questTitle += ` 🔑`;
                // Set up quest targets
                let targets = "";
                if (questData.targets && questData.targets.length > 1) {
                    questData.targets.forEach(target => {
                        if (targets.length == 0) {
                            targets = target;
                        } else {
                            targets += `, ${target}`;
                        };
                    });
                };

                mhEmbed
                    .setAuthor({ name: questTitle })
                    .setDescription(`${questData.description} -${questData.client}`)
                    .addField("Game:", questData.game, true)
                    .addField("Type:", questData.questType, true)
                    .addField("Map:", questData.map, true)
                    .addField("Objective:", questData.objective, true);
                if (targets.length > 0) mhEmbed.addField("Targets:", targets, true);
                break;
            // All quests from a game
            case "quests":
                let gameName = interaction.options.getString("game").toLowerCase();
                // Add quests matching game title to an array
                let questsTotal = questsJSON.quests.filter(quest => quest.game == gameName);
                if (questsTotal.length == 0) return sendMessage({ client: client, interaction: interaction, content: "Could not find any quests for that game. If you are certain this game exists the quest list may still be a work in progress." });
                // Sort by difficulty
                questsTotal = questsTotal.sort(compare);

                mhEmbed
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: `${gameName} Quests` });

                let totalQuests = questsTotal.length;
                let pageLength = 25;
                let currentPage = 1; // Load page 1 on command use
                let questsPaged = questsTotal.reduce((questsTotal, item, index) => {
                    const chunkIndex = Math.floor(index / pageLength);
                    // start a new chunk
                    if (!questsTotal[chunkIndex]) questsTotal[chunkIndex] = [];

                    questsTotal[chunkIndex].push(item);
                    return questsTotal;
                }, []);
                let totalPages = questsPaged.length;

                questsPaged[currentPage - 1].forEach(quest => {
                    let questTitle = `${quest.difficulty}⭐ ${quest.name}`;
                    if (quest.isKey) questTitle += ` 🔑`;
                    mhEmbed.addField(`${questTitle}`, `${quest.objective} in ${quest.map}`, false);
                });

                let startIndex = currentPage + pageLength * currentPage;
                let endIndex = startIndex + pageLength - 1;
                mhEmbed.setFooter({ text: `Page ${currentPage}/${totalPages}` });
                // Function to sort by difficulty
                function compare(a, b) {
                    if (a.difficulty > b.difficulty) return -1;
                    if (a.difficulty < b.difficulty) return 1;
                    return 0;
                };
                break;
            // Monsters
            case "monster":
                let monsterName = interaction.options.getString("monster").toLowerCase();
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
                if (!monsterData) return sendMessage({ client: client, interaction: interaction, content: "Could not find the specified monster." });

                let messageObject = await getMonster(client, interaction, monsterData, ephemeral);
                return sendMessage({ client: client, interaction: interaction, embeds: messageObject.embeds, components: messageObject.components, ephemeral: ephemeral })
                break;
        };
        return sendMessage({ client: client, interaction: interaction, embeds: mhEmbed, ephemeral: ephemeral, components: buttonArray });

    } catch (e) {
        // Log error
        logger(e, client, interaction);
    };
};

let mhRiseString = "Monster Hunter Rise";
let mhWorldString = "Monster Hunter World";
let mhguString = "Monster Hunter Generations Ultimate";
let mh4uString = "Monster Hunter 4 Ultimate";
let mh3uString = "Monster Hunter 3 Ultimate";
let mhStories2String = "Monster Hunter Stories 2";
let mhStoriesString = "Monster Hunter Stories";

module.exports.config = {
    name: "monsterhunter",
    description: "Shows Monster Hunter data.",
    options: [{
        name: "quest",
        type: "SUB_COMMAND",
        description: "Get info on a specific quest.",
        options: [{
            name: "quest",
            type: "STRING",
            description: "Specify quest by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "quests",
        type: "SUB_COMMAND",
        description: "List all quests from a game.",
        options: [{
            name: "game",
            type: "STRING",
            description: "Specify game by name or abbreviation.",
            required: true,
            choices: [
                { name: mhRiseString, value: mhRiseString },
                { name: mhWorldString, value: mhWorldString },
                { name: mhguString, value: mhguString },
                { name: mh4uString, value: mh4uString },
                { name: mh3uString, value: mh3uString },
                { name: mhStories2String, value: mhStories2String },
                { name: mhStoriesString, value: mhStoriesString }
            ]
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }, {
        name: "monster",
        type: "SUB_COMMAND",
        description: "Get info on a monster.",
        options: [{
            name: "monster",
            type: "STRING",
            description: "Specify monster by its English name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: "BOOLEAN",
            description: "Whether the reply will be private."
        }]
    }]
};