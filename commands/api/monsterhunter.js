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

        let adminBot = isAdmin(client, interaction.guild.me);
        let ephemeral = true;
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg === false) ephemeral = false;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.me.permissions.has("USE_EXTERNAL_EMOJIS") && !adminBot) emotesAllowed = false;
        let buttonArray = [];
        await interaction.deferReply({ ephemeral: ephemeral });
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

                // Generalize game names and abbreviations
                // Only World and Rise are currently supported; but since other game are WIP I want to filter them either way
                let MH3Titles = [
                    "monster hunter 3 ultimate",
                    "monster hunter 3",
                    "monster hunter 3u",
                    "mh3",
                    "mh3u",
                    "3",
                    "3u"
                ];
                let MH4Titles = [
                    "monster hunter 4 ultimate",
                    "monster hunter 4",
                    "monster hunter 4u",
                    "mh4",
                    "mh4u",
                    "3",
                    "3u"
                ];
                let MHGUTitles = [
                    "monster hunter generations ultimate",
                    "monster hunter generations",
                    "monster hunter generations u",
                    "mhg",
                    "mhgu",
                    "g",
                    "gu"
                ];
                let MH5Titles = [
                    "monster hunter world",
                    "monster hunter 5",
                    "monster hunter world iceborne",
                    "mh5",
                    "mhw",
                    "mhwi",
                    "world"
                ];
                let MH5PTitles = [
                    "monster hunter rise",
                    "monster hunter 5 portable",
                    "monster hunter rise sunbreak",
                    "mhr",
                    "mh5p",
                    "rise"
                ];
                let MHSTTitles = [
                    "monster hunter stories",
                    "mhs",
                    "mhst",
                    "stories"
                ];
                let MHST2Titles = [
                    "monster hunter stories 2",
                    "monster hunter stories 2 wings of ruin",
                    "mhs2",
                    "mhst2",
                    "stories 2"
                ];
                if (MH3Titles.includes(gameName)) gameName = "Monster Hunter 3 Ultimate"
                if (MH4Titles.includes(gameName)) gameName = "Monster Hunter 4 Ultimate";
                if (MHGUTitles.includes(gameName)) gameName = "Monster Hunter Generations Ultimate";
                if (MH5Titles.includes(gameName)) gameName = "Monster Hunter World";
                if (MH5PTitles.includes(gameName)) gameName = "Monster Hunter Rise";
                if (MHSTTitles.includes(gameName)) gameName = "Monster Hunter Stories";
                if (MHST2Titles.includes(gameName)) gameName = "Monster Hunter Stories 2";

                // Add quests matching game title to an array
                let questsTotal = questsJSON.quests.filter(quest => quest.game == gameName);
                if (questsTotal.length == 0) return sendMessage({ client: client, interaction: interaction, content: "Could not find any quests for that game. If you are certain this game exists the quest list may still be a work in progress." });

                // Sort by difficulty
                questsTotal = questsTotal.sort(compare);

                mhEmbed
                    .setColor(globalVars.embedColor)
                    .setAuthor({ name: `${gameName} Quests` }); // Game name instead of input because of capitalization

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
            autocomplete: true,
            required: true
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