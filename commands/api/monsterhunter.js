import {
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import logger from "../../util/logger.js";
import sendMessage from "../../util/sendMessage.js";
import globalVars from "../../objects/globalVars.json" with { type: "json" };
import randomNumber from "../../util/randomNumber.js";
import getMonster from "../../util/mh/getMonster.js";
import getQuests from "../../util/mh/getQuests.js";
import monstersJSON from "../../submodules/monster-hunter-DB/monsters.json" with { type: "json" };
import questsJSON from "../../submodules/monster-hunter-DB/quests.json" with { type: "json" };

let mhRiseString = "Monster Hunter Rise";
let mhWorldString = "Monster Hunter World";
let mhguString = "Monster Hunter Generations Ultimate";
let mh4uString = "Monster Hunter 4 Ultimate";
let mh3uString = "Monster Hunter 3 Ultimate";
let mhStories2String = "Monster Hunter Stories 2";
let mhStoriesString = "Monster Hunter Stories";

export default async (interaction, ephemeral) => {
    try {
        let ephemeralArg = interaction.options.getBoolean("ephemeral");
        if (ephemeralArg !== null) ephemeral = ephemeralArg;

        let buttonArray = [];
        let mhEmbed = new EmbedBuilder()
            .setColor(globalVars.embedColor);

        switch (interaction.options.getSubcommand()) {
            // Specific quest
            case "quest":
                let questName = interaction.options.getString("quest").toLowerCase();
                let questData;
                questsJSON.quests.forEach(quest => {
                    if (quest.name.toLowerCase() == questName) questData = quest;
                });
                if (!questData) return sendMessage({ interaction: interaction, content: "Could not find the specified quest." });
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
            case "questlist":
                let gameName = interaction.options.getString("game");
                let questsMessageObject = await getQuests({ client: interaction.client, interaction: interaction, gameName: gameName, page: 1 });
                return sendMessage({ interaction: interaction, embeds: questsMessageObject.embeds, components: questsMessageObject.components, ephemeral: ephemeral });
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
                if (!monsterData) return sendMessage({ interaction: interaction, content: "Could not find the specified monster." });

                let messageObject = await getMonster(interaction, monsterData, ephemeral);
                return sendMessage({ interaction: interaction, embeds: messageObject.embeds, components: messageObject.components, ephemeral: ephemeral })
        };
        return sendMessage({ interaction: interaction, embeds: mhEmbed, ephemeral: ephemeral, components: buttonArray });

    } catch (e) {
        logger({ exception: e, interaction: interaction });
    };
};

const gameChoices = [
    { name: mhRiseString, value: mhRiseString },
    { name: mhWorldString, value: mhWorldString },
    { name: mhguString, value: mhguString },
    { name: mh4uString, value: mh4uString },
    { name: mh3uString, value: mh3uString },
    { name: mhStories2String, value: mhStories2String },
    { name: mhStoriesString, value: mhStoriesString }
];

// String options
const monsterOption = new SlashCommandStringOption()
    .setName("monster")
    .setDescription("Specify monster by name.")
    .setAutocomplete(true)
    .setRequired(true);
const questOption = new SlashCommandStringOption()
    .setName("quest")
    .setDescription("Specify quest by name.")
    .setAutocomplete(true)
    .setRequired(true);
const gameOption = new SlashCommandStringOption()
    .setName("game")
    .setDescription("Specify game by name.")
    .setChoices(gameChoices)
    .setRequired(true);
// Boolean options
const ephemeralOption = new SlashCommandBooleanOption()
    .setName("ephemeral")
    .setDescription(globalVars.ephemeralOptionDescription);
// Subcommands
const monsterSubcommand = new SlashCommandSubcommandBuilder()
    .setName("monster")
    .setDescription("Get info on a monster.")
    .addStringOption(monsterOption)
    .addBooleanOption(ephemeralOption);
const questSubcommand = new SlashCommandSubcommandBuilder()
    .setName("quest")
    .setDescription("Get info on a quest.")
    .addStringOption(questOption)
    .addBooleanOption(ephemeralOption);
const questlistSubcommand = new SlashCommandSubcommandBuilder()
    .setName("questlist")
    .setDescription("List all quests from a game.")
    .addStringOption(gameOption)
    .addBooleanOption(ephemeralOption);
// Final command
export const commandObject = new SlashCommandBuilder()
    .setName("monsterhunter")
    .setDescription("Shows Monster Hunter data.")
    .addSubcommand(monsterSubcommand)
    .addSubcommand(questSubcommand)
    .addSubcommand(questlistSubcommand);