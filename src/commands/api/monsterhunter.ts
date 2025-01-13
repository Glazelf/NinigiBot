import {
    MessageFlags,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandBooleanOption,
    SlashCommandSubcommandBuilder,
    ColorResolvable
} from "discord.js";
import sendMessage from "../../util/discord/sendMessage.js";
import randomNumber from "../../util/math/randomNumber.js";
import getMonster from "../../util/mh/getMonster.js";
import getQuests from "../../util/mh/getQuests.js";
import normalizeString from "../../util/string/normalizeString.js";

import globalVars from "../../objects/globalVars.json";

import monstersJSON from "../../../submodules/monster-hunter-DB/monsters.json";
import questsJSON from "../../../submodules/monster-hunter-DB/quests.json";

const mhRiseString = "Monster Hunter Rise";
const mhWorldString = "Monster Hunter World";
const mhguString = "Monster Hunter Generations Ultimate";
const mh4uString = "Monster Hunter 4 Ultimate";
const mh3uString = "Monster Hunter 3 Ultimate";
const mhStories2String = "Monster Hunter Stories 2";
const mhStoriesString = "Monster Hunter Stories";

export default async (interaction: any, messageFlags: any) => {
    let buttonArray: any = [];
    let mhEmbed = new EmbedBuilder()
        .setColor(globalVars.embedColor as ColorResolvable);
    let nameInput = interaction.options.getString("name");

    switch (interaction.options.getSubcommand()) {
        // Specific quest
        case "quest":
            let questName = normalizeString(nameInput);
            let questData;
            questsJSON.quests.forEach((quest: any) => {
                if (normalizeString(quest.name) == questName) questData = quest;
            });
            if (!questData) return sendMessage({ interaction: interaction, content: "Could not find the specified quest.", flags: messageFlags.add(MessageFlags.Ephemeral) });
            // Format quest title
            // @ts-expect-error TS(2339): Property 'difficulty' does not exist on type 'neve... Remove this comment to see the full error message
            let questTitle = `${questData.difficulty}⭐ ${questData.name}`;
            // @ts-expect-error TS(2339): Property 'isKey' does not exist on type 'never'.
            if (questData.isKey) questTitle += ` 🔑`;
            // Set up quest targets
            let targets = "";
            // @ts-expect-error TS(2339): Property 'targets' does not exist on type 'never'.
            if (questData.targets && questData.targets.length > 1) {
                // @ts-expect-error TS(2339): Property 'targets' does not exist on type 'never'.
                questData.targets.forEach((target: any) => {
                    if (targets.length == 0) {
                        targets = target;
                    } else {
                        targets += `, ${target}`;
                    };
                });
            };
            mhEmbed
                .setTitle(questTitle)
                // @ts-expect-error TS(2339): Property 'description' does not exist on type 'nev... Remove this comment to see the full error message
                .setDescription(`${questData.description} -${questData.client}`)
                .addFields([
                    // @ts-expect-error TS(2339): Property 'game' does not exist on type 'never'.
                    { name: "Game:", value: questData.game, inline: true },
                    // @ts-expect-error TS(2339): Property 'questType' does not exist on type 'never... Remove this comment to see the full error message
                    { name: "Type:", value: questData.questType, inline: true },
                    // @ts-expect-error TS(2339): Property 'map' does not exist on type 'never'.
                    { name: "Map:", value: questData.map, inline: true },
                    // @ts-expect-error TS(2339): Property 'objective' does not exist on type 'never... Remove this comment to see the full error message
                    { name: "Objective:", value: questData.objective, inline: true }
                ]);
            if (targets.length > 0) mhEmbed.addFields([{ name: "Targets:", value: targets, inline: true }]);
            break;
        // All quests from a game
        case "questlist":
            const gameInput = interaction.options.getString("game");
            let questsMessageObject = await getQuests({ gameName: gameInput, page: 1 });
            // @ts-expect-error TS(2339): Property 'content' does not exist on type '{}'.
            return sendMessage({ interaction: interaction, content: questsMessageObject.content, embeds: questsMessageObject.embeds, components: questsMessageObject.components, flags: messageFlags });
        // Monsters
        case "monster":
            let monsterName = normalizeString(nameInput);
            // Get monster
            let monsterData;
            if (monsterName == "random") {
                // Get random monster
                let randomIndex = randomNumber(0, monstersJSON.monsters.length);
                monsterData = monstersJSON.monsters[randomIndex];
            } else {
                // Get named monster
                monstersJSON.monsters.forEach((monster: any) => {
                    if (normalizeString(monster.name) == monsterName) monsterData = monster;
                });
            };
            if (!monsterData) return sendMessage({ interaction: interaction, content: "Could not find the specified monster.", flags: messageFlags.add(MessageFlags.Ephemeral) });

            let messageObject = await getMonster(monsterData, interaction.client.application.emojis.cache);
            return sendMessage({ interaction: interaction, embeds: messageObject.embeds, components: messageObject.components, flags: messageFlags })
    };
    return sendMessage({ interaction: interaction, embeds: mhEmbed, components: buttonArray, flags: messageFlags });
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
    .setName("name")
    .setDescription("Specify monster by name.")
    .setAutocomplete(true)
    .setRequired(true);
const questOption = new SlashCommandStringOption()
    .setName("name")
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