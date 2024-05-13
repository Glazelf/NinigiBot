const Discord = require("discord.js");
exports.run = async (client, interaction, logger, ephemeral = true) => {
    try {
        const sendMessage = require('../../util/sendMessage');
        const randomNumber = require('../../util/randomNumber');
        const capitalizeString = require('../../util/capitalizeString');
        const isAdmin = require('../../util/isAdmin');
        const getMonster = require('../../util/mh/getMonster');
        const getQuests = require('../../util/mh/getQuests');
        const monstersJSON = require("../../submodules/monster-hunter-DB/monsters.json");
        const questsJSON = require("../../submodules/monster-hunter-DB/quests.json");
        const elementEmotes = require('../../objects/monsterhunter/elementEmotes.json');

        let adminBot = isAdmin(client, interaction.guild.members.me);
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;
        let emotesAllowed = true;
        if (ephemeral == true && !interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.UseExternalEmojis) && !adminBot) emotesAllowed = false;

        let buttonArray = [];
        let mhEmbed = new Discord.EmbedBuilder()
            .setColor(client.globalVars.embedColor);

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
                    .setTitle(questTitle)
                    .setDescription(`${questData.description} -${questData.client}`)
                    .addFields([
                        { name: "Game:", value: questData.game, inline: true },
                        { name: "Type:", value: questData.questType, inline: true },
                        { name: "Map:", value: questData.map, inline: true },
                        { name: "Objective:", value: questData.objective, inline: true }
                    ]);
                if (targets.length > 0) mhEmbed.addFields([{ name: "Targets:", value: targets, inline: true }]);
                break;
            // All quests from a game
            case "quests":
                let gameName = interaction.options.getString("game");
                let questsMessageObject = await getQuests({ client: client, interaction: interaction, gameName: gameName, page: 1 });
                return sendMessage({ client: client, interaction: interaction, embeds: questsMessageObject.embeds, components: questsMessageObject.components, ephemeral: ephemeral });
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
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a specific quest.",
        options: [{
            name: "quest",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify quest by name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "quests",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "List all quests from a game.",
        options: [{
            name: "game",
            type: Discord.ApplicationCommandOptionType.String,
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
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }, {
        name: "monster",
        type: Discord.ApplicationCommandOptionType.Subcommand,
        description: "Get info on a monster.",
        options: [{
            name: "monster",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Specify monster by its English name.",
            autocomplete: true,
            required: true
        }, {
            name: "ephemeral",
            type: Discord.ApplicationCommandOptionType.Boolean,
            description: "Whether the reply will be private."
        }]
    }]
};